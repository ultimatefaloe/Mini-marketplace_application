import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type {
  ICart,
  IAddToCartPayload,
  IUpdateCartItemPayload,
  FrontendSafe,
} from '@/types';

/**
 * Mutation function for adding item to cart
 */
export const addToCartMutation = async (data: IAddToCartPayload): Promise<FrontendSafe<ICart>> => {
  const response = await apiClient.post<FrontendSafe<ICart>>('/carts', data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for updating cart item
 */
export const updateCartItemMutation = async (
  data: IUpdateCartItemPayload
): Promise<FrontendSafe<ICart>> => {
  const response = await apiClient.patch<FrontendSafe<ICart>>(`/carts/${data.itemId}`, data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for removing item from cart
 */
export const removeFromCartMutation = async (itemId: string): Promise<FrontendSafe<ICart>> => {
  const response = await apiClient.delete<FrontendSafe<ICart>>(`/carts/${itemId}`);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for clearing cart
 */
export const clearCartMutation = async (): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>('/carts');

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for adding item to cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCartMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};

/**
 * Hook for updating cart item
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItemMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};

/**
 * Hook for removing item from cart
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromCartMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};

/**
 * Hook for clearing cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCartMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};