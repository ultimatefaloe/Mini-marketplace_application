import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AuthGuard } from '@/components/auth';

export const Route = createFileRoute('/(root)/_rootLayout/__authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AuthGuard requireAuth={true}>
      <Outlet />
    </AuthGuard>
  );
}