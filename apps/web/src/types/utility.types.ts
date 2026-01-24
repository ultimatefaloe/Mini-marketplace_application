/**
 * Make specific fields optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific fields required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Omit MongoDB document fields
 */
export type OmitMongoFields<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * Convert Date fields to string (for JSON serialization)
 */
export type DateToString<T> = {
  [K in keyof T]: T[K] extends Date 
    ? string 
    : T[K] extends Date | null 
    ? string | null
    : T[K] extends Date | undefined
    ? string | undefined
    : T[K];
};

/**
 * Frontend-safe version (dates as strings)
 */
export type FrontendSafe<T> = DateToString<T>;
