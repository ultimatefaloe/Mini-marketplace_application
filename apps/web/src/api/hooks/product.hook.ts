import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { IProductQueryFilters, IProductListItem, FrontendSafe, IPaginatedResponse } from '@/types';
import {
  productsQuery,
  paginatedProductsQuery,
  productQuery,
  productBySlugQuery,
  featuredProductsQuery,
  relatedProductsQuery,
} from '../queries';
import { queryKeys } from '../cache-keys';
import { apiClient } from '../client';

/**
 * Hook for fetching products list (data only, no pagination metadata)
 */
export const useProducts = (filters?: IProductQueryFilters) => {
  return useQuery(productsQuery(filters));
};

/**
 * Hook for fetching products with full pagination metadata
 */
export const usePaginatedProducts = (filters?: IProductQueryFilters) => {
  return useQuery(paginatedProductsQuery(filters));
};

/**
 * Hook for infinite scroll products
 */
export const useInfiniteProducts = (filters?: IProductQueryFilters) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.all(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam), ...filters as any });
      const response = await apiClient.get<IPaginatedResponse<FrontendSafe<IProductListItem>>>(
        `/products?${params.toString()}`
      );

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

/**
 * Hook for fetching a single product by ID
 */
export const useProduct = (id: string, enabled = true) => {
  return useQuery({
    ...productQuery(id),
    enabled: !!id && enabled,
  });
};

/**
 * Hook for fetching a single product by slug
 */
export const useProductBySlug = (slug: string, enabled = true) => {
  return useQuery({
    ...productBySlugQuery(slug),
    enabled: !!slug && enabled,
  });
};

/**
 * Hook for fetching featured products
 */
export const useFeaturedProducts = (limit?: number) => {
  return useQuery(featuredProductsQuery(limit));
};

/**
 * Hook for fetching related products
 */
export const useRelatedProducts = (productId: string, limit?: number, enabled = true) => {
  return useQuery({
    ...relatedProductsQuery(productId, limit),
    enabled: !!productId && enabled,
  });
};