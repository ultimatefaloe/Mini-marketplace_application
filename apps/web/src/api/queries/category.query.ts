import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type { ICategory, ICategoryTreeNode } from '@/types';

/**
 * Query options factory for categories list
 */
export const categoriesQuery = (filters?: Record<string, any>) => ({
  queryKey: queryKeys.categories.all(filters),
  queryFn: async (): Promise<ICategory[]> => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get<ICategory[]>(`/categories?${params.toString()}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for category tree
 */
export const categoryTreeQuery = () => ({
  queryKey: queryKeys.categories.tree(),
  queryFn: async (): Promise<ICategoryTreeNode[]> => {
    const response = await apiClient.get<ICategoryTreeNode[]>('/categories/tree');

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
  staleTime: 10 * 60 * 1000, // 10 minutes
});

/**
 * Query options factory for single category by ID
 */
export const categoryQuery = (id: string) => ({
  queryKey: queryKeys.categories.detail(id),
  queryFn: async (): Promise<ICategory> => {
    const response = await apiClient.get<ICategory>(`/categories/${id}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for single category by slug
 */
export const categoryBySlugQuery = (slug: string) => ({
  queryKey: queryKeys.categories.bySlug(slug),
  queryFn: async (): Promise<ICategory> => {
    const response = await apiClient.get<ICategory>(`/categories/slug/${slug}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});