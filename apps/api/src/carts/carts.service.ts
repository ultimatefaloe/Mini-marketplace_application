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
    const productIds = createCartDto.items.map(i => i.productId);

    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .lean()
      .exec();

    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products not found or inactive");
    }

    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart) {
      cart = await this.cartModel.create({
        userId: user.auth_id,
        items: createCartDto.items.map(item => {
          const product = productMap.get(item.productId);
          if (!product) throw new NotFoundException("Product not found");

          return {
            productId: new Types.ObjectId(item.productId),
            nameSnapshot: product.name,
            priceSnapshot: product.price,
            productImage: product.images?.[0],
            quantity: item.quantity,
            variantOptions: item.variantOptions
          };
        })
      });

      return { success: true, message: 'Item added to cart', data: cart.items.length };
    }

    // 🔁 Update existing cart
    for (const newItem of createCartDto.items) {
      const product = productMap.get(newItem.productId);
      if (!product) throw new NotFoundException("Product not found");

      const existingItem = cart.items.find(item =>
        item.productId.toString() === newItem.productId &&
        this.isSameVariant(item.variantOptions, newItem.variantOptions)
      );

      if (existingItem) {
        existingItem.quantity = newItem.quantity;
      } else {
        cart.items.push({
          productId: new Types.ObjectId(newItem.productId),
          nameSnapshot: product.name,
          priceSnapshot: product.price,
          productImage: product.images?.[0],
          quantity: newItem.quantity,
          variantOptions: newItem.variantOptions
        });
      }
    }

    await cart.save();

    return {
      success: true,
      message: 'Item added to cart',
      data: cart
    };
  }

  async getCart(user: JwtPayload) {
    const cart = await this.cartModel
      .findOne({ userId: user.auth_id })
      .populate('items.productId', 'name price stock isActive images')
      .lean()
      .exec();

    if (!cart) throw new NotFoundException("No item found in cart");

    const items = cart.items.map(item => {
      const product = item.productId as any;

      const price = product?.price ?? item.priceSnapshot;
      const isAvailable =
        product?.isActive && (product?.stock ?? 0) >= item.quantity;

      return {
        _id: item._id,
        productId: product?._id ?? item.productId,
        nameSnapshot: product?.name ?? item.nameSnapshot,
        priceSnapshot: price,
        quantity: item.quantity,
        productImage: product?.images?.[0] ?? item.productImage,
        variantOptions: item.variantOptions,
        stock: product?.stock ?? 0,
        isAvailable,
        priceChanged: product && product.price !== item.priceSnapshot,
        originalPrice: item.priceSnapshot,
        subtotal: price * item.quantity
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      success: true,
      message: 'Cart retrieve successfully',
      data: {
        items,
        subtotal,
        totalItems,
        isEmpty: items.length === 0
      }
    };
  }

  async updateCartItem(
    itemId: string,
    updateDto: UpdateCartItemDto,
    user: JwtPayload,
  ) {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid cart item ID');
    }

    if (updateDto.quantity < 0) {
      throw new BadRequestException('Quantity must be zero or greater');
    }

    const cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item._id?.toString() === itemId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    const cartItem = cart.items[itemIndex];

    // Remove item if quantity is 0
    if (updateDto.quantity === 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();

      return {
        success: true,
        message: 'Item removed from cart',
        data: this.getCartItemCount(cart),
      };
    }

    // Fetch product only when needed
    const product = await this.productModel
      .findById(cartItem.productId)
      .select('price name stock isActive')
      .lean()
      .exec();

    if (!product || !product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    if (product.stock < updateDto.quantity) {
      throw new BadRequestException(
        `Only ${product.stock} items available in stock`,
      );
    }

    // Update cart item
    cartItem.quantity = updateDto.quantity;
    cartItem.priceSnapshot = product.price;
    cartItem.nameSnapshot = product.name;

    // Optional: update variant snapshot
    if (updateDto.variantOptions) {
      cartItem.variantOptions = updateDto.variantOptions;
    }

    await cart.save();

    return {
      success: true,
      message: 'Cart updated',
      data: this.getCartItemCount(cart),
    };
  }

  async removeFromCart(itemId: string, user: JwtPayload) {
    console.log(itemId)
    if (!Types.ObjectId.isValid(itemId)) {
      throw new BadRequestException('Invalid item ID');
    }

    const cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item._id && item?._id.toString() !== itemId
    );

    if (cart.items.length === initialLength) {
      throw new NotFoundException('Item not found in cart');
    }

    await cart.save();

    return {
      success: true,
      message: 'Item removed from cart',
      data: cart.items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  async clearCart(user: JwtPayload) {
    const cart = await this.cartModel.findOne({ userId: user.auth_id }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    await cart.save();

    return { success: true, message: 'Cart cleared' };
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
      success: true,
      message: `Cart synced. ${updated} items updated.`,
      data: productIds.length - cart.items.length
    };
  }

  private isSameVariant(a?: any, b?: any): boolean {
    return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
  }

  private getCartItemCount(cart: CartDocument): number {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

}