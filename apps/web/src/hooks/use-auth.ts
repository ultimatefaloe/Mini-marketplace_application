import React, { useCallback } from 'react';
import { useAuthStore } from '@/store';
import { useValidateToken, useLogout } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, role, setAuth, clearAuth, setLoading } = useAuthStore();
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
      if (validationData.valid) {
        setAuth(validationData.user);
      } else {
        clearAuth();
      }
      setLoading(false);
    }
  }, [validationData, isValidating, setAuth, clearAuth, setLoading]);

  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const isUser = role === UserRole.USER;
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isValidating,
    role,
    isAdmin,
    isUser,
    isSuperAdmin,
    setAuth,
    clearAuth,
    logout,
  };
};