import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AuthGuard } from '@/components/auth';
import { useTokenRefresh } from '@/hooks';

export const Route = createFileRoute('/(auth)/_auth')({
  component: AuthLayout,
});

function AuthLayout() {
  useTokenRefresh();

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    </AuthGuard>
  );
}