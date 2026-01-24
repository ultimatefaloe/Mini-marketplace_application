import type { IBaseDocument, ITimestamps, ObjectId } from "./base.types";
import type { ICategory } from "./category.types";

export interface IVariantOptions {
  sizes: string[];
  colors: string[];
  materials: string[];
  genders: string[];
}

/**
 * Product base interface
 */
export interface IProduct extends IBaseDocument, ITimestamps {
  name: string;
  description?: string;
  categoryId: ObjectId;
  brand?: string;
  variantOptions: IVariantOptions;
  tags: string[];
  discount: number;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  createdBy: ObjectId;
  viewCount: number;
  soldCount: number;
}

/**
 * Product with populated category
 */
export interface IProductWithCategory extends Omit<IProduct, 'categoryId'> {
  category: ICategory;
}

/**
 * Product list item (lightweight for listings)
 */
export interface IProductListItem {
  _id: ObjectId;
  slug: string;
  name: string;
  description?: string;
  categoryId: ObjectId;
  brand?: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
  isActive: boolean;
  tags: string[];
  viewCount: number;
  soldCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Product creation payload
 */
export interface ICreateProductPayload {
  name: string;
  description?: string;
  categoryId: ObjectId;
  brand?: string;
  variantOptions?: Partial<IVariantOptions>;
  tags?: string[];
  discount?: number;
  price: number;
  stock?: number;
  images?: string[];
}

/**
 * Product update payload
 */
export interface IUpdateProductPayload {
  name?: string;
  description?: string;
  categoryId?: ObjectId;
  brand?: string;
  variantOptions?: Partial<IVariantOptions>;
  tags?: string[];
  discount?: number;
  price?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
}

/**
 * Product query filters
 */
export interface IProductQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: ObjectId;
  brand?: string;
  tags?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}