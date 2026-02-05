import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks'
import { VendorSideBar } from '@/components/vendor/vendor-sidebar'
import { VendorHeader } from '@/components/vendor/vendor-header'
import React from 'react'

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout')({
  component: AdminLayout,
})

function AdminLayout() {
  const { isAuthenticated, isVendor } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }
  if (!isAuthenticated || !isVendor) {
    return <Navigate to="/vendor/login" />
  }

  return (
    <div className="min-h-screen bg-mmp-neutral">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div>
        <VendorSideBar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header - Sticky with same width as main content */}
        <div className="sticky top-0 z-30 lg:z-20">
          <VendorHeader onMenuClick={toggleMobileSidebar} />
        </div>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
