import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { type JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { Cart, CartDocument } from 'src/models/cart.schema';
import { CreateCartDto, UpdateCartItemDto } from './dto';
import { Product, ProductDocument } from 'src/models/product.shcema';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) { }

  async addToCart(createCartDto: CreateCartDto, user: JwtPayload) {
    const productIds = createCartDto.items.map(r => r.productId);
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .lean()
      .exec();

    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products not found or inactive");
    }

    // Create product lookup map
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Find existing cart or create new one
    let cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart) {
      // Create new cart with snapshots
      const itemsWithSnapshots = createCartDto.items.map(item => {
        const product = productMap.get(item.productId);
        if (!product) throw new NotFoundException("Product not found")
        return {
          productId: new Types.ObjectId(item.productId),
          nameSnapshot: product.name,
          priceSnapshot: product.price,
          quantity: item.quantity
        };
      });

      cart = await this.cartModel.create({
        userId: user.auth_id,
        items: itemsWithSnapshots
      });
    } else {
      // Update existing cart
      for (const newItem of createCartDto.items) {
        const product = productMap.get(newItem.productId);

        if (!product) throw new NotFoundException("Product not found")

        const existingItemIndex = cart.items.findIndex(
          item => item.productId.toString() === newItem.productId
        );

        if (existingItemIndex > -1) {
          // Update quantity for existing item
          cart.items[existingItemIndex].quantity = newItem.quantity;
        } else {
          // Add new item with snapshots
          cart.items.push({
            productId: new Types.ObjectId(newItem.productId),
            nameSnapshot: product.name,
            priceSnapshot: product.price,
            quantity: newItem.quantity
          });
        }
      }

      await cart.save();
    }

    return {
      message: 'Item added to cart',
      cartItemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  async getCart(user: JwtPayload) {
    const cart = await this.cartModel
      .findOne({ userId: user.auth_id })
      .populate('items.productId', 'name price imageUrl stock isActive')
      .lean()
      .exec();

    if (!cart) throw new NotFoundException("No item found in card")

    // Calculate totals and check product availability
    const items = cart.items.map(item => {
      const product = item.productId as any;
      const isAvailable = product?.isActive && (product?.stock ?? 0) >= item.quantity;

      return {
        _id: item.productId._id,
        productId: item.productId._id,
        name: product?.name || item.nameSnapshot,
        price: product?.price || item.priceSnapshot,
        quantity: item.quantity,
        imageUrl: product?.imageUrl,
        stock: product?.stock || 0,
        isAvailable,
        priceChanged: product && product.price !== item.priceSnapshot,
        originalPrice: item.priceSnapshot,
        subtotal: (product?.price || item.priceSnapshot) * item.quantity
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      totalItems,
      isEmpty: items.length === 0
    };
  }

  async updateCartItem(productId: string, updateDto: UpdateCartItemDto, user: JwtPayload) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    if (updateDto.quantity < 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    if (updateDto.quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify stock availability
      const product = await this.productModel.findById(productId).lean().exec();

      if (!product || !product.isActive) {
        throw new BadRequestException('Product is not available');
      }

      if (product.stock < updateDto.quantity) {
        throw new BadRequestException(`Only ${product.stock} items available in stock`);
      }

      // Update quantity and refresh snapshots
      cart.items[itemIndex].quantity = updateDto.quantity;
      cart.items[itemIndex].priceSnapshot = product.price;
      cart.items[itemIndex].nameSnapshot = product.name;
    }

    await cart.save();

    return {
      message: updateDto.quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cartItemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  async removeFromCart(productId: string, user: JwtPayload) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      throw new NotFoundException('Item not found in cart');
    }

    await cart.save();

    return {
      message: 'Item removed from cart',
      cartItemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  async clearCart(user: JwtPayload) {
    const cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    await cart.save();

    return { message: 'Cart cleared' };
  }

  async syncCartPrices(user: JwtPayload) {
    const cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart || cart.items.length === 0) {
      return { message: 'No items to sync' };
    }

    const productIds = cart.items.map(item => item.productId);
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .lean()
      .exec();

    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    let updated = 0;

    cart.items = cart.items.filter(item => {
      const product = productMap.get(item.productId.toString());

      if (!product || !product.isActive) {
        return false; // Remove unavailable products
      }

      if (item.priceSnapshot !== product.price || item.nameSnapshot !== product.name) {
        item.priceSnapshot = product.price;
        item.nameSnapshot = product.name;
        updated++;
      }

      return true;
    });

    await cart.save();

    return {
      message: `Cart synced. ${updated} items updated.`,
      itemsRemoved: productIds.length - cart.items.length
    };
  }
}