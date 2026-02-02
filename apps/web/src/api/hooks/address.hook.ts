import { useQuery } from '@tanstack/react-query';
import { addressesQuery, addressQuery, shippingFeeQuery } from '../queries';

/**
 * Hook for fetching cart
 */
export const useAddressesQuery = () => {
  return useQuery(addressesQuery());
};

export const useAddressQuery = (addressId: string) => {
  return useQuery(addressQuery(addressId));
};

export const useShippingFeeQuery = (addressId: string) => {
  return useQuery(shippingFeeQuery(addressId));
};