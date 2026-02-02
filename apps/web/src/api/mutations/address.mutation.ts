import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type { IUpdateAddress,ICreateAddress, FrontendSafe, IAddress } from '@/types';

/**
 * Mutation function for adding address
 */
export const addAddressMutation = async (data: ICreateAddress): Promise<FrontendSafe<IAddress>> => {
  const response = await apiClient.post<FrontendSafe<IAddress>>('/address', data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for updating address
 */
export const updateAddressMutation = async (
  data: IUpdateAddress
): Promise<FrontendSafe<IAddress>> => {
  const response = await apiClient.patch<FrontendSafe<IAddress>>(`/address/${data._id}`, data);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

/**
 * Mutation function for removing address
 */
export const deleteAddressMutation = async (addressId: string): Promise<string | undefined> => {
  const response = await apiClient.delete(`/address/${addressId}`);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.message;
};


// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for adding item to cart
 */
export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAddressMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.lists() });
    },
  });
};

/**
 * Hook for updating cart item
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAddressMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.lists() });
    },
  });
};

/**
 * Hook for removing item from cart
 */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddressMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.lists() });
    },
  });
};