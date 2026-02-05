import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Home,
  Package,
  ShoppingCart,
  Wallet,
  Settings,
  User,
  LogOut,
  X,
  // TrendingUp,
  // MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks';

interface VendorSideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const vendorNavItems = [
  {
    title: 'Dashboard',
    href: '/vendor',
    icon: Home,
    badge: 'updated',
  },
  {
    title: 'Products',
    href: '/vendor/products',
    icon: Package,
    count: 24,
  },
  {
    title: 'Orders',
    href: '/vendor/orders',
    icon: ShoppingCart,
    count: 12,
  },
  // {
  //   title: 'Analytics',
  //   href: '/vendor/analytics',
  //   icon: TrendingUp,
  // },
  {
    title: 'Wallet',
    href: '/vendor/wallet',
    icon: Wallet,
  },
  // {
  //   title: 'Messages',
  //   href: '/vendor/messages',
  //   icon: MessageSquare,
  //   count: 3,
  // },
  {
    title: 'Settings',
    href: '/vendor/settings',
    icon: Settings,
  },
];

export const VendorSideBar: React.FC<VendorSideBarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const router = useRouter();
  const { vendor, logout } = useAuth();
  const currentPath = router.state.location.pathname;

  const handleLogout = async () => {
    await logout();
    if (onMobileClose) onMobileClose();
  };

  const handleNavClick = () => {
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col bg-gradient-to-b from-mmp-primary2 to-mmp-primary min-h-0 shadow-xl">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Store Portal
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <nav className="space-y-2">
              {vendorNavItems.map((item) => {
                const isActive = 
                  currentPath === item.href || 
                  (item.href !== '/vendor' && currentPath.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'h-5 w-5',
                          isActive ? 'text-white' : 'text-white/60'
                        )}
                      />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {(item.count || item.badge) && (
                      <div className={cn(
                        'px-2 py-1 rounded-full text-xs font-semibold',
                        isActive ? 'bg-white text-mmp-primary' : 'bg-white/20 text-white'
                      )}>
                        {item.count || item.badge}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Profile Section */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {vendor?.businessName || 'Store'}
                  </p>
                  <p className="text-xs text-white/70 truncate">
                    ID: {vendor?._id?.toString().slice(-8) || 'VENDOR-XXX'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start mt-2 text-white hover:bg-white/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-gradient-to-b from-mmp-primary2 to-mmp-primary">
          <div className="flex-1 flex flex-col pt-8 pb-6 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 mb-10">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Package className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block">
                  FashionKet
                </span>
                <span className="text-sm text-white/80">Store Portal</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-6 flex-1 px-4 space-y-2">
              {vendorNavItems.map((item) => {
                const isActive = 
                  currentPath === item.href || 
                  (item.href !== '/vendor' && currentPath.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'h-5 w-5',
                          isActive ? 'text-white' : 'text-white/60'
                        )}
                      />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {(item.count || item.badge) && (
                      <div className={cn(
                        'px-2 py-1 rounded-full text-xs font-semibold min-w-[24px] text-center',
                        isActive ? 'bg-white text-mmp-primary' : 'bg-white/20 text-white'
                      )}>
                        {item.count || item.badge}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Profile Section */}
          <div className="flex-shrink-0 border-t border-white/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {vendor?.businessName || 'Store'}
                </p>
                <p className="text-xs text-white/70 truncate">
                  ID: {vendor?._id?.toString().slice(-8) || 'VENDOR-XXX'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};