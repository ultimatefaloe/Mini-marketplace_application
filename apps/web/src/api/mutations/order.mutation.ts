import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type {
  IOrder,
  ICreateOrderPayload,
  IUpdateOrderStatusPayload,
  ICancelOrderPayload,
  FrontendSafe,
} from '@/types';

/**
 * Mutation function for creating an order
 */
export const createOrderMutation = async (data: ICreateOrderPayload): Promise<FrontendSafe<IOrder>> => {
  const response = await apiClient.post<FrontendSafe<IOrder>>('/orders', data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for updating order status
 */
export const updateOrderStatusMutation = async ({
  id,
  data,
}: {
  id: string;
  data: IUpdateOrderStatusPayload;
}): Promise<FrontendSafe<IOrder>> => {
  const response = await apiClient.patch<FrontendSafe<IOrder>>(`/orders/${id}/status`, data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for canceling an order
 */
export const cancelOrderMutation = async ({
  id,
  data,
}: {
  id: string;
  data?: ICancelOrderPayload;
}): Promise<{ message: string; order: FrontendSafe<IOrder> }> => {
  const response = await apiClient.post<{ message: string; order: FrontendSafe<IOrder> }>(
    `/orders/${id}/cancel`,
    data
  );

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for creating an order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrderMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Hook for updating order status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatusMutation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
    },
  });
};

/**
 * Hook for canceling an order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrderMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};