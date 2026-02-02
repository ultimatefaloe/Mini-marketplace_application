import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type {
  IOrder,
  IOrderListItem,
  IPaginatedResponse,
  IOrderQueryFilters,
  IOrderStats,
  FrontendSafe,
} from '@/types';

/**
 * Query options factory for orders list
 */
export const ordersQuery = (filters?: IOrderQueryFilters) => ({
  queryKey: queryKeys.orders.all(filters),
  queryFn: async (): Promise<IPaginatedResponse<FrontendSafe<IOrderListItem[]>>> => {
    const params = new URLSearchParams(filters as any);
    const response = await apiClient.get<IPaginatedResponse<FrontendSafe<IOrderListItem[]>>>(
      `/orders?${params.toString()}`
    );

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for single order by ID
 */
export const orderQuery = (id: string) => ({
  queryKey: queryKeys.orders.detail(id),
  queryFn: async (): Promise<FrontendSafe<IOrder>> => {
    const response = await apiClient.get<FrontendSafe<IOrder>>(`/orders/${id}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for single order by order number
 */
export const orderByNumberQuery = (orderNumber: string) => ({
  queryKey: queryKeys.orders.byNumber(orderNumber),
  queryFn: async (): Promise<FrontendSafe<IOrder>> => {
    const response = await apiClient.get<FrontendSafe<IOrder>>(`/orders/number/${orderNumber}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

/**
 * Query options factory for order statistics
 */
export const orderStatsQuery = (userId?: string) => ({
  queryKey: queryKeys.orders.stats(userId),
  queryFn: async (): Promise<IOrderStats> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await apiClient.get<IOrderStats>(`/orders/stats${params}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});