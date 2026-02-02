import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks';
import { VendorSideBar } from '@/components/vendor/vendor-sidebar';
import { VendorHeader } from '@/components/vendor/vendor-header';

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout')({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAuthenticated, isVendor } = useAuth();

  if (!isAuthenticated || !isVendor) {
    return <Navigate to="/vendor/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <VendorSideBar />
      <div className="flex-1 flex flex-col">
        <VendorHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}