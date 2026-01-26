import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './cache-keys';
import type {
  ILoginCredentials,
  ISignupCredentials,
  IUserAuthResponse,
  IAdminAuthResponse,
  ITokenValidationResponse,
  IPasswordResetRequest,
  IPasswordResetPayload,
  ICreateAdminPayload,
} from '@/types';

// Queries
export const useValidateToken = () => {
  return useQuery({
    queryKey: queryKeys.auth.validate(),
    queryFn: () => apiClient.get<ITokenValidationResponse>('/auth/validate'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useUserSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ISignupCredentials) =>
      apiClient.post<IUserAuthResponse>('/auth/user/signup', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useUserLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ILoginCredentials) =>
      apiClient.post<IUserAuthResponse>('/auth/user/signin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useUserGoogleAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.get<IUserAuthResponse>('/auth/user/google'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useAdminSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateAdminPayload) =>
      apiClient.post<IAdminAuthResponse>('/auth/admin/signup', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ILoginCredentials) =>
      apiClient.post<IAdminAuthResponse>('/auth/admin/signin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post<{ message: string }>('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useRequestPasswordReset = (type: 'user' | 'admin') => {
  return useMutation({
    mutationFn: (data: IPasswordResetRequest) =>
      apiClient.post<{ message: string }>(`/auth/${type}/request-reset`, data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: IPasswordResetPayload) =>
      apiClient.post<{ message: string }>('/auth/reset-password', data),
  });
};