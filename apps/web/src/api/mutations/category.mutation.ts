import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type {
  ICategory,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
  ICategoryReorderPayload,
} from '@/types';

/**
 * Mutation function for creating a category
 */
export const createCategoryMutation = async (data: ICreateCategoryPayload): Promise<ICategory> => {
  const response = await apiClient.post<ICategory>('/categories', data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for updating a category
 */
export const updateCategoryMutation = async ({
  id,
  data,
}: {
  id: string;
  data: IUpdateCategoryPayload;
}): Promise<ICategory> => {
  const response = await apiClient.patch<ICategory>(`/categories/${id}`, data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for deleting a category
 */
export const deleteCategoryMutation = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/categories/${id}`);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for reordering categories
 */
export const reorderCategoriesMutation = async (
  updates: ICategoryReorderPayload[]
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/categories/reorder', updates);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for creating a category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategoryMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Hook for updating a category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Hook for deleting a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * Hook for reordering categories
 */
export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderCategoriesMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};