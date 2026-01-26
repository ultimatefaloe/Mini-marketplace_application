import type { IBaseDocument, ITimestamps, ObjectId } from "./base.types";
import type { IProduct } from "./product.types";

export interface ICartItem {
  productId: ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
}

/**
 * Cart base interface
 */
export interface ICart extends IBaseDocument, ITimestamps {
  userId: ObjectId;
  items: ICartItem[];
}

/**
 * Cart with populated products
 */
export interface ICartWithProducts extends Omit<ICart, 'items'> {
  items: Array<ICartItem & { product: IProduct }>;
}

/**
 * Add to cart payload
 */
export interface IAddToCartPayload {
  productId: ObjectId;
  quantity: number;
}

/**
 * Update cart item payload
 */
export interface IUpdateCartItemPayload {
  productId: ObjectId;
  quantity: number;
}

/**
 * Cart summary
 */
export interface ICartSummary {
  itemCount: number;
  subtotal: number;
  items: ICartItem[];
}