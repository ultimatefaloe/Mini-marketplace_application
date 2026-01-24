import type { IBaseDocument, ITimestamps, ObjectId } from "./base.types";

export interface ICategory extends IBaseDocument, ITimestamps {
  name: string;
  slug: string;
  parentId: ObjectId | null;
  isActive: boolean;
  description?: string;
  icon: string;
  order: number;
  createdBy: ObjectId;
}

/**
 * Category with children (hierarchical)
 */
export interface ICategoryWithChildren extends ICategory {
  children: ICategoryWithChildren[];
}

/**
 * Category tree node (lightweight)
 */
export interface ICategoryTreeNode {
  _id: ObjectId;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

/**
 * Category creation payload
 */
export interface ICreateCategoryPayload {
  name: string;
  slug?: string;
  parentId?: ObjectId;
  description?: string;
  icon?: string;
  order?: number;
}

/**
 * Category update payload
 */
export interface IUpdateCategoryPayload {
  name?: string;
  slug?: string;
  parentId?: ObjectId;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

/**
 * Category reorder payload
 */
export interface ICategoryReorderPayload {
  id: ObjectId;
  order: number;
}