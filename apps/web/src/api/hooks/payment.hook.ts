import { useQuery } from '@tanstack/react-query';
import { orderPaymentQuery, paymentReferenceQuery, paymentsQuery, verifyPaymentQuery } from '../queries/payment.query';

/**
 * Hook for fetching cart
 */
export const useVerifyPaymentQuery = (reference: string) => {
  return useQuery(verifyPaymentQuery(reference));
};

export const usePaymentReferenceQuery = (reference: string) => {
  return useQuery(paymentReferenceQuery(reference));
};

export const useOrderPayentQuery = (orderId: string) => {
  return useQuery(orderPaymentQuery(orderId));
};

export const usePaymentsQuery = (filters?: { limit: number, skip: number }) => {
  return useQuery(paymentsQuery(filters));
};