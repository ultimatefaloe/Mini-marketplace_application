import React from 'react';
import { useTokenRefresh } from '@/hooks';
import { useValidateToken } from '@/api/queries/auth.query';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAuth, clearAuth, setLoading, setAuthVendor, setAuthAdmin } = useAuthStore();
  const { data: validationData, isLoading: isValidating } = useValidateToken();
  
  useTokenRefresh();

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
   }, [validationData, isValidating, setAuth, clearAuth, setLoading]);

  return <>{children}</>;
};