import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './cache-keys';
import type {
  IOrder,
  IOrderListItem,
  IPaginatedResponse,
  ICreateOrderPayload,
  IUpdateOrderStatusPayload,
  ICancelOrderPayload,
  IOrderQueryFilters,
  IOrderStats,
  FrontendSafe,
} from '@/types';

// Queries
export const useOrders = (filters?: IOrderQueryFilters) => {
  return useQuery({
    queryKey: queryKeys.orders.all(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters as any);
      return apiClient.get<IPaginatedResponse<FrontendSafe<IOrderListItem>>>(
        `/orders?${params.toString()}`
      );
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => apiClient.get<FrontendSafe<IOrder>>(`/orders/${id}`),
    enabled: !!id,
  });
};

export const useOrderByNumber = (orderNumber: string) => {
  return useQuery({
    queryKey: queryKeys.orders.byNumber(orderNumber),
    queryFn: () => apiClient.get<FrontendSafe<IOrder>>(`/orders/number/${orderNumber}`),
    enabled: !!orderNumber,
  });
};

export const useOrderStats = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.orders.stats(userId),
    queryFn: () => {
      const params = userId ? `?userId=${userId}` : '';
      return apiClient.get<IOrderStats>(`/orders/stats${params}`);
    },
  });
};

// Mutations
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateOrderPayload) =>
      apiClient.post<FrontendSafe<IOrder>>('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateOrderStatusPayload }) =>
      apiClient.patch<FrontendSafe<IOrder>>(`/orders/${id}/status`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ICancelOrderPayload }) =>
      apiClient.post<{ message: string; order: FrontendSafe<IOrder> }>(
        `/orders/${id}/cancel`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};