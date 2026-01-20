import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto, QueryOrderDto } from './dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AppRolesEnum } from 'src/type/role';
import { Product, ProductDocument } from 'src/models/product.shcema';
import { Order, OrderDocument, OrderStatus, OrderItemSchema } from 'src/models/order.schema';
import { Cart, CartDocument } from 'src/models/cart.schema';

interface OrderItem {
  productId: Types.ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>
  ) { }

  async create(createOrderDto: CreateOrderDto, user: JwtPayload) {
    const orderItems: OrderItem[] = [];

    // 1. Determine item source (cart first, fallback to DTO)
    const cart = await this.cartModel.findOne({ userId: user.auth_id }).lean();

    const sourceItems = (cart && cart.items.length > 0)
      ? cart.items.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
      }))
      : createOrderDto.items;

    if (!sourceItems || sourceItems.length === 0) {
      throw new BadRequestException('No items to create order');
    }

    // 2. Fetch products
    const productIds = sourceItems.map(i => i.productId);
    const products = await this.productModel
      .find({ _id: { $in: productIds }, isActive: true })
      .lean()
      .exec();

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found or inactive');
    }

    // 3. Build order items
    let subtotalAmount = 0;

    for (const item of sourceItems) {
      const product = products.find(
        p => p._id.toString() === item.productId,
      );

      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        );
      }

      const subtotal = product.price * item.quantity;
      subtotalAmount += subtotal;

      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        nameSnapshot: product.name,
        priceSnapshot: product.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // 4. Calculate totals
    const shippingFee = this.calculateShipping(subtotalAmount);
    const discountAmount = 0;
    const totalAmount = subtotalAmount + shippingFee - discountAmount;

    // 5. Generate order number
    const orderNumber = await this.generateOrderNumber();

    // 6. Create order
    const order = await this.orderModel.create({
      userId: new Types.ObjectId(user.auth_id),
      orderNumber,
      items: orderItems,
      subtotalAmount,
      shippingFee,
      totalAmount,
      status: OrderStatus.PENDING_PAYMENT,
      shippingAddress: createOrderDto.shippingAddress,
      notes: createOrderDto.notes,
    });

    // 7. Reserve stock
    await this.reserveStock(sourceItems);

    // 8. (Optional but recommended) Clear cart after order
    if (cart && cart.items.length > 0) {
      await this.cartModel.updateOne(
        { userId: user.auth_id },
        { $set: { items: [] } }
      );
    }

    return this.toDetailEntity(order);
  }


  async findAll(query: QueryOrderDto, user: JwtPayload) {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      orderNumber,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    // Regular users can only see their own orders
    if (user.role === 'user') {
      filter.userId = new Types.ObjectId(user.auth_id);
    } else if (userId) {
      // Admins can filter by userId
      filter.userId = new Types.ObjectId(userId);
    }

    if (status) {
      filter.status = status;
    }

    if (orderNumber) {
      filter.orderNumber = new RegExp(orderNumber, 'i');
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .select(
          '_id orderNumber totalAmount status items createdAt paidAt',
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      data: orders.map((o) => this.toListEntity(o)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'email profile')
      .populate('items.productId', 'name')
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Users can only view their own orders
    if (user.role === AppRolesEnum.USER && order.userId._id.toString() !== user.auth_id) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return this.toDetailEntity(order);
  }

  async findByOrderNumber(orderNumber: string, user: JwtPayload) {
    const order = await this.orderModel
      .findOne({ orderNumber })
      .populate('userId', 'email profile')
      .populate('items.productId', 'name')
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Users can only view their own orders
    if (user.role === AppRolesEnum.USER && order.userId._id.toString() !== user.auth_id) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return this.toDetailEntity(order);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
    user: JwtPayload,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, updateStatusDto.status);

    // Update status and timestamps
    order.status = updateStatusDto.status;

    if (updateStatusDto.status === OrderStatus.PAID && !order.paidAt) {
      order.paidAt = new Date();
    }

    if (updateStatusDto.status === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date();
      if (updateStatusDto.trackingNumber) {
        order.trackingNumber = updateStatusDto.trackingNumber;
      }
    }

    if (updateStatusDto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    if (updateStatusDto.notes) {
      order.notes = updateStatusDto.notes;
    }

    await order.save();

    return this.toDetailEntity(order);
  }

  async cancel(id: string, cancelDto: CancelOrderDto, user: JwtPayload) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Users can only cancel their own orders
    if (user.role === AppRolesEnum.USER && order.userId.toString() !== user.auth_id) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    // Can only cancel pending or paid orders
    if (
      ![OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.PROCESSING].includes(
        order.status,
      )
    ) {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = cancelDto.reason || 'Customer requested cancellation';

    await order.save();

    // Release reserved stock
    await this.releaseStock(order.items);

    return { message: 'Order cancelled successfully', order: this.toDetailEntity(order) };
  }

  async getOrderStats(userId?: string) {
    const match: any = {};
    if (userId) {
      match.userId = new Types.ObjectId(userId);
    }

    const stats = await this.orderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const total = await this.orderModel.countDocuments(match);
    const totalRevenue = await this.orderModel.aggregate([
      { $match: { ...match, status: OrderStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    return {
      total,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount,
        };
        return acc;
      }, {}),
    };
  }

  // ========== HELPER METHODS ==========
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  private calculateShipping(subtotal: number): number {
    // Simple shipping logic - customize as needed
    if (subtotal >= 50000000) return 0; // Free shipping over 500 NGN
    return 2000000; // 20 NGN flat rate
  }

  // private calculateTax(subtotal: number): number {
  //   // Simple tax calculation - customize as needed
  //   const TAX_RATE = 0.075; // 7.5% VAT
  //   return Math.round(subtotal * TAX_RATE);
  // }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private async reserveStock(items: Array<{ productId: string; quantity: number }>) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(item.productId),
        },
        update: {
          $inc: {
            'product.stock': -item.quantity,
            soldCount: item.quantity,
          },
        },
      },
    }));

    await this.productModel.bulkWrite(bulkOps);
  }

  private async releaseStock(items: Array<{ productId: Types.ObjectId; quantity: number }>) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: {
          _id: item.productId,
        },
        update: {
          $inc: {
            'product.stock': item.quantity,
            soldCount: -item.quantity,
          },
        },
      },
    }));

    await this.productModel.bulkWrite(bulkOps);
  }

  private toListEntity(order: any): any {
    return {
      _id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      itemCount: order.items?.length || 0,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    };
  }

  private toDetailEntity(order: any): any {
    return order;
  }
}