import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type {
  IProduct,
  IProductListItem,
  IPaginatedResponse,
  IProductQueryFilters,
  FrontendSafe,
} from '@/types';

/**
 * Query options factory for products list
 * Can be used in TanStack Query or route loaders
 */
export const productsQuery = (filters?: IProductQueryFilters) => ({
  queryKey: queryKeys.products.all(filters),
  queryFn: async (): Promise<IPaginatedResponse<FrontendSafe<IProductListItem>[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<IPaginatedResponse<FrontendSafe<IProductListItem>[]>>(
      `/products?${params.toString()}`
    );

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for paginated products
 * Returns full pagination metadata
 */
export const paginatedProductsQuery = (filters?: IProductQueryFilters) => ({
  queryKey: queryKeys.products.all(filters),
  queryFn: async (): Promise<IPaginatedResponse<FrontendSafe<IProductListItem>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<IPaginatedResponse<FrontendSafe<IProductListItem>>>(
      `/products?${params.toString()}`
    );

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for single product by ID
 */
export const productQuery = (id: string) => ({
  queryKey: queryKeys.products.detail(id),
  queryFn: async (): Promise<FrontendSafe<IProduct>> => {
    const response = await apiClient.get<FrontendSafe<IProduct>>(`/products/${id}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for single product by slug
 */
export const productBySlugQuery = (slug: string) => ({
  queryKey: queryKeys.products.bySlug(slug),
  queryFn: async (): Promise<FrontendSafe<IProduct>> => {
    const response = await apiClient.get<FrontendSafe<IProduct>>(`/products/slug/${slug}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for featured products
 */
export const featuredProductsQuery = (limit?: number) => ({
  queryKey: queryKeys.products.featured(limit),
  queryFn: async (): Promise<FrontendSafe<IProductListItem>[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<FrontendSafe<IProductListItem>[]>(
      `/products/featured${params}`
    );

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for related products
 */
export const relatedProductsQuery = (slug: string, limit?: number) => ({
  queryKey: queryKeys.products.related(slug, limit),
  queryFn: async (): Promise<FrontendSafe<IProductListItem>[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<FrontendSafe<IProductListItem>[]>(
      `/products/${slug}/related${params}`
    );

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});


//  ======= VENDOR ========

/**
 * Query options factory for products list
 * Can be used in TanStack Query or route loaders
 */
export const vendorProductsQuery = (filters?: IProductQueryFilters) => ({
  queryKey: queryKeys.products.all(filters),
  queryFn: async (): Promise<IPaginatedResponse<FrontendSafe<IProductListItem>[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<IPaginatedResponse<FrontendSafe<IProductListItem>[]>>(
      `/products/vendor?${params.toString()}`
    );

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});