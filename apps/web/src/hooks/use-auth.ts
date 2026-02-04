import React, { useCallback } from 'react';
import { useAuthStore } from '@/store';
import { useValidateToken, useLogout } from '@/api/queries';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@/types';

export const useAuth = () => {
  const { user, vendor, admin, isAuthenticated, isLoading, role, setAuth, setAuthAdmin, setAuthVendor, clearAuth, setLoading } = useAuthStore();
  const { data: validationData, isLoading: isValidating } = useValidateToken();
  const { mutateAsync: logoutMutate } = useLogout();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      await logoutMutate();
    } finally {
      clearAuth();
      queryClient.clear();
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [logoutMutate, clearAuth, queryClient]);

  // Sync auth state with token validation
  React.useEffect(() => {
    if (!isValidating && validationData) {
      if (!validationData.valid) {
        clearAuth()
        setLoading(false)
        return
      }

      const user = validationData.user

      switch (user.role) {
        case UserRole.USER:
          setAuth(user) // ✅ IUser
          break

        case UserRole.VENDOR:
          setAuthVendor(user) // ✅ IVendor
          break

        case UserRole.ADMIN:
        case UserRole.SUPER_ADMIN:
          setAuthAdmin(user) // ✅ IAdmin
          break

        default:
          clearAuth()
      }

      setLoading(false)
    }
  }, [validationData, isValidating])

  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const isVendor = role === UserRole.VENDOR
  const isUser = role === UserRole.USER;
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  return {
    user,
    vendor,
    admin,
    isAuthenticated,
    isLoading: isLoading || isValidating,
    role,
    isAdmin,
    isVendor,
    isUser,
    isSuperAdmin,
    setAuth,
    setAuthVendor,
    setAuthAdmin,
    clearAuth,
    logout,
  };
};