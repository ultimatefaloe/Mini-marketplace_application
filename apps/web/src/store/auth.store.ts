import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser, IAdmin, UserRole } from '@/types';
import type { IVendor } from '@/types/vendor.type';

interface AuthState {
  user: IUser | null;
  vendor: IVendor | null;
  admin: IAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  setAuth: (user: IUser) => void;
  setAuthVendor: (vendor: IVendor) => void;
  setAuthAdmin: (admin: IAdmin) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      vendor: null,
      admin: null,
      isAuthenticated: false,
      isLoading: true,
      role: null,
      setAuth: (user) => set({
        user,
        isAuthenticated: true,
        role: user.role,
        isLoading: false
      }),
      setAuthVendor: (vendor) => set({
        vendor,
        isAuthenticated: true,
        role: vendor.role,
        isLoading: false
      }),
      setAuthAdmin: (admin) => set({
        admin,
        isAuthenticated: true,
        role: admin.role,
        isLoading: false
      }),
      clearAuth: () => set({
        user: null,
        vendor: null,
        admin: null,
        isAuthenticated: false,
        role: null,
        isLoading: false
      }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'fashionket-auth-storage',
      partialize: (state) => ({
        user: state.user,
        vendor: state.vendor,
        admin: state.admin,
        role: state.role,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);