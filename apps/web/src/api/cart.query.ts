
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './cache-keys';
import type {
  ICart,
  IAddToCartPayload,
  IUpdateCartItemPayload,
  FrontendSafe,
} from '@/types';

// Queries
export const useCart = () => {
  return useQuery({
    queryKey: queryKeys.cart.detail(),
    queryFn: () => apiClient.get<FrontendSafe<ICart>>('/carts'),
  });
};

// Mutations
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IAddToCartPayload) =>
      apiClient.post<FrontendSafe<ICart>>('/carts/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateCartItemPayload) =>
      apiClient.patch<FrontendSafe<ICart>>('/carts/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      apiClient.delete<FrontendSafe<ICart>>(`/carts/items/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete<{ message: string }>('/carts'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};