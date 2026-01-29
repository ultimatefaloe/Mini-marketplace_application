import { useQuery } from '@tanstack/react-query';
import { cartQuery } from '../queries';

/**
 * Hook for fetching cart
 */
export const useCart = () => {
  return useQuery(cartQuery());
};