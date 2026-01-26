import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './cache-keys';
import type {
  IProduct,
  IProductListItem,
  IPaginatedResponse,
  ICreateProductPayload,
  IUpdateProductPayload,
  IProductQueryFilters,
  FrontendSafe,
} from '@/types';

// Queries
export const useProducts = (filters?: IProductQueryFilters) => {
  return useQuery({
    queryKey: queryKeys.products.all(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      return apiClient.get<IPaginatedResponse<FrontendSafe<IProductListItem>>>(
        `/products?${params.toString()}`
      );
    },
  });
};

export const useInfiniteProducts = (filters?: IProductQueryFilters) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.all(filters),
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam), ...filters as any });
      return apiClient.get<IPaginatedResponse<FrontendSafe<IProductListItem>>>(
        `/products?${params.toString()}`
      );
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => apiClient.get<FrontendSafe<IProduct>>(`/products/${id}`),
    enabled: !!id,
  });
};

// Mutations
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateProductPayload) =>
      apiClient.post<FrontendSafe<IProduct>>('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateProductPayload }) =>
      apiClient.patch<FrontendSafe<IProduct>>(`/products/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ message: string }>(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
};

export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<{ message: string }>(`/products/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sku, quantity }: { id: string; sku: string; quantity: number }) =>
      apiClient.patch(`/products/${id}/stock/${sku}`, { quantity }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
    },
  });
};