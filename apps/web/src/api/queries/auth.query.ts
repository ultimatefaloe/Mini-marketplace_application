import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../cache-keys';
import type {
  ILoginCredentials,
  ISignupCredentials,
  IUserAuthResponse,
  ITokenValidationResponse,
  IPasswordResetRequest,
  IPasswordResetPayload,
  ICreateAdminPayload,
  IUser,
  IAdmin,
} from '@/types';
import type { IVendor, IVendorAuthResponse } from '@/types/vendor.type';

// Queries
export const useValidateToken = () => {
  return useQuery({
    queryKey: queryKeys.auth.validate(),
    queryFn: () => apiClient.getData<ITokenValidationResponse>('/auth/validate'),
    retry: false,
    staleTime: 2 * 60 * 1000, // 1 minutes
  });
};

// Mutations
// ========== USER ROUTES ==========
export const useUserSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ISignupCredentials) =>
      apiClient.post<IUser>('/auth/user/signup', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useUserLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ILoginCredentials) =>
      apiClient.post<IUser>('/auth/user/signin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useUserGoogleAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.getData<IUserAuthResponse>('/auth/user/google'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

// ========== VENDOR ROUTES ==========
export const useVendorSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ISignupCredentials) =>
      apiClient.post<IVendor>('/auth/vendor/signup', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useVendorLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ILoginCredentials) =>
      apiClient.post<IVendor>('/auth/vendor/signin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useVendorGoogleAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.getData<IVendorAuthResponse>('/auth/vendor/google'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

// ========== ADMIN ROUTES ==========
export const useAdminSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateAdminPayload) =>
      apiClient.post<IAdmin>('/auth/admin/signup', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ILoginCredentials) =>
      apiClient.post<IAdmin>('/auth/admin/signin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.validate() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.postData<{ message: string }>('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useRequestPasswordReset = (type: 'user' | 'admin') => {
  return useMutation({
    mutationFn: (data: IPasswordResetRequest) =>
      apiClient.postData<{ message: string }>(`/auth/${type}/request-reset`, data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: IPasswordResetPayload) =>
      apiClient.postData<{ message: string }>('/auth/reset-password', data),
  });
};