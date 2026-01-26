import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './cache-keys';
import type {
  ICategory,
  ICategoryTreeNode,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
  ICategoryReorderPayload,
  FrontendSafe,
} from '@/types';

// Queries
export const useCategories = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.categories.all(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters);
      return apiClient.get<FrontendSafe<ICategory>[]>(`/categories?${params.toString()}`);
    },
  });
};

export const useCategoryTree = () => {
  return useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: () => apiClient.get<ICategoryTreeNode[]>('/categories/tree'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => apiClient.get<FrontendSafe<ICategory>>(`/categories/${id}`),
    enabled: !!id,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.categories.bySlug(slug),
    queryFn: () => apiClient.get<FrontendSafe<ICategory>>(`/categories/slug/${slug}`),
    enabled: !!slug,
  });
};

// Mutations
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateCategoryPayload) =>
      apiClient.post<FrontendSafe<ICategory>>('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateCategoryPayload }) =>
      apiClient.patch<FrontendSafe<ICategory>>(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ message: string }>(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: ICategoryReorderPayload[]) =>
      apiClient.post<{ message: string }>('/categories/reorder', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};