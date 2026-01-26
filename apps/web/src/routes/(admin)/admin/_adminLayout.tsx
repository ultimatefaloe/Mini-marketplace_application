import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const Route = createFileRoute('/(admin)/admin/_adminLayout')({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAuthenticated, isAdmin } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin text-mmp-primary" />
  //     </div>
  //   );
  // }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}