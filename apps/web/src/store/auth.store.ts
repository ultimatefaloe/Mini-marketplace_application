import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser, IAdmin, UserRole } from '@/types';

interface AuthState {
  user: IUser | IAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  setAuth: (user: IUser | IAdmin) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      role: null,
      setAuth: (user) => set({ 
        user, 
        isAuthenticated: true, 
        role: user.role,
        isLoading: false 
      }),
      clearAuth: () => set({ 
        user: null, 
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
        role: state.role,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);