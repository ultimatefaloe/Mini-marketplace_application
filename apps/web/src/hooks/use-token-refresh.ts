import { useEffect } from 'react';
import { apiClient } from '@/api';
import { useAuthStore } from '@/store';

const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (before 15min expiry)

export const useTokenRefresh = () => {
  const { isAuthenticated, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshToken = async () => {
      try {
        setLoading(true);
        await apiClient.get('/auth/refresh');
        setLoading(false);
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Auth will be cleared on next validation
      }
    };

    // Initial refresh check
    refreshToken();

    // Set up interval for refreshing
    const intervalId = setInterval(refreshToken, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, setLoading]);
};