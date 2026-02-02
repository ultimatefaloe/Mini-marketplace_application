import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type { ICart, FrontendSafe } from '@/types';

/**
 * Query options factory for cart
 */
export const cartQuery = () => ({
  queryKey: queryKeys.cart.detail(),
  queryFn: async (): Promise<FrontendSafe<ICart>> => {
    const response = await apiClient.get<FrontendSafe<ICart>>('/carts');

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});