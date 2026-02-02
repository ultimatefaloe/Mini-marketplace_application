import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type { FrontendSafe, IPayment } from '@/types';

/**
 * Query options factory for cart
 */
export const verifyPaymentQuery = (reference: string) => ({
  queryKey: queryKeys.payments.detail(reference),
  queryFn: async (): Promise<FrontendSafe<IPayment>> => {
    const response = await apiClient.get<FrontendSafe<IPayment>>(`/payments/verify/${reference}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

export const paymentReferenceQuery = (reference: string) => ({
  queryKey: queryKeys.payments.detail(reference),
  queryFn: async (): Promise<FrontendSafe<IPayment>> => {
    const response = await apiClient.get<FrontendSafe<IPayment>>(`/payments/reference/${reference}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

export const orderPaymentQuery = (orderId: string) => ({
  queryKey: queryKeys.payments.detail(orderId),
  queryFn: async (): Promise<FrontendSafe<IPayment>> => {
    const response = await apiClient.get<FrontendSafe<IPayment>>(`/payments/order/${orderId}`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
});

export const paymentsQuery = (filters?: { limit?: number, skip?: number }) => ({
  queryKey: queryKeys.payments.lists(filters),
  queryFn: async (): Promise<FrontendSafe<IPayment[]>> => {
    const response = await apiClient.get<FrontendSafe<IPayment[]>>(`/payments/history?`);

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
}); 