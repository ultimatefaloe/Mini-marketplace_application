import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type { FrontendSafe, IInitializePaymentPayload, IPaymentInitializationResponse } from '@/types';

/**
 * Mutation function for init payment
 */
export const initPaymaentMutation = async (data: IInitializePaymentPayload): Promise<FrontendSafe<IPaymentInitializationResponse>> => {
  const response = await apiClient.post<FrontendSafe<IPaymentInitializationResponse>>('/payments/initialize', data);

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
export const useInitPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initPaymaentMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() })
    },
  });
};