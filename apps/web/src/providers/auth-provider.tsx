import React from 'react';
import { useTokenRefresh } from '@/hooks';
import { useValidateToken } from '@/api/auth.query';
import { useAuthStore } from '@/store/auth.store';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  const { data: validationData, isLoading: isValidating } = useValidateToken();
  
  useTokenRefresh();

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

  return <>{children}</>;
};