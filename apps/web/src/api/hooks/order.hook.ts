import { useQuery } from '@tanstack/react-query';
import type { IOrderQueryFilters } from '@/types';
import {
  ordersQuery,
  orderQuery,
  orderByNumberQuery,
  orderStatsQuery,
} from '../queries';

/**
 * Hook for fetching orders list
 */
export const useOrdersQuery = (filters?: IOrderQueryFilters) => {
  return useQuery(ordersQuery(filters));
};

/**
 * Hook for fetching a single order by ID
 */
export const useOrderQuery = (id: string, enabled = true) => {
  return useQuery({
    ...orderQuery(id),
    enabled: !!id && enabled,
  });
};

/**
 * Hook for fetching a single order by order number
 */
export const useOrderByNumberQuery = (orderNumber: string, enabled = true) => {
  return useQuery({
    ...orderByNumberQuery(orderNumber),
    enabled: !!orderNumber && enabled,
  });
};

/**
 * Hook for fetching order statistics
 */
export const useOrderStatsQuery = (userId?: string) => {
  return useQuery(orderStatsQuery(userId));
};