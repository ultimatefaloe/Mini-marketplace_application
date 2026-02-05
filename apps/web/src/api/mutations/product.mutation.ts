import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type {
  IProduct,
  IUpdateProductPayload,
  FrontendSafe,
} from '@/types';

/**
 * Mutation function for creating a product
 */
export const createProductMutation = async (data: FormData): Promise<FrontendSafe<IProduct>> => {
  const response = await apiClient.post<FrontendSafe<IProduct>>('/products', data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for updating a product
 */
export const updateProductMutation = async ({
  id,
  data,
}: {
  id: string;
  data: IUpdateProductPayload;
}): Promise<FrontendSafe<IProduct>> => {
  const response = await apiClient.patch<FrontendSafe<IProduct>>(`/products/${id}`, data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for deleting a product
 */
export const deleteProductMutation = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/products/${id}`);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for deactivating a product
 */
export const deactivateProductMutation = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.patch<{ message: string }>(`/products/${id}/deactivate`);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for updating product stock
 */
export const updateStockMutation = async ({
  id,
  sku,
  quantity,
}: {
  id: string;
  sku: string;
  quantity: number;
}): Promise<void> => {
  const response = await apiClient.patch<void>(`/products/${id}/stock/${sku}`, { quantity });

  if (!response.success) {
    throw new Error(response.error.message);
  }
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for creating a product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
    },
  });
};

/**
 * Hook for updating a product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductMutation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.id] });
    },
  });
};

/**
 * Hook for deleting a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
    },
  });
};

/**
 * Hook for deactivating a product
 */
export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateProductMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
    },
  });
};

/**
 * Hook for updating product stock
 */
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStockMutation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.id] });
    },
  });
};