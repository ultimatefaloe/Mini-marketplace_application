export type ObjectId = string;

/**
 * Timestamps interface for all documents
 */
export interface ITimestamps {
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Base document interface with MongoDB _id
 */
export interface IBaseDocument {
  _id: ObjectId;
}

/**
 * Pagination metadata
 */
export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPaginationMeta;
}