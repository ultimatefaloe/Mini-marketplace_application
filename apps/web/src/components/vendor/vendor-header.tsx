import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Menu, 
  Search, 
  HelpCircle,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface VendorHeaderProps {
  onMenuClick?: () => void;
}

export const VendorHeader: React.FC<VendorHeaderProps> = ({ onMenuClick }) => {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white shadow-md border-b border-mmp-primary/10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden text-mmp-primary2 hover:bg-mmp-primary/10"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Brand */}
            <div className="hidden md:flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-mmp-primary to-mmp-primary2 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-mmp-primary2">Store Dashboard</span>
            </div>

            {/* Search - Hidden on small mobile */}
            <div className="hidden sm:block flex-1 max-w-md ml-4">
              <div className="relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
                  isSearchFocused ? "text-mmp-primary" : "text-gray-400"
                )} />
                <Input
                  placeholder="Search products, orders, customers..."
                  className="pl-10 bg-gray-50 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-mmp-primary2 hover:bg-mmp-primary/10"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex text-mmp-primary2 hover:bg-mmp-primary/10"
              asChild
            >
              <Link to="/vendor">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-mmp-primary2 hover:bg-mmp-primary/10"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                    Mark all read
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-60 overflow-y-auto">
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <div className="space-y-1">
                      <p className="font-medium">New Order Received</p>
                      <p className="text-sm text-gray-600">Order #ORD-78945 has been placed</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <div className="space-y-1">
                      <p className="font-medium">Payment Received</p>
                      <p className="text-sm text-gray-600">₦45,000 has been added to your wallet</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center cursor-pointer text-mmp-primary hover:text-mmp-primary2">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar (Shows on focus) */}
        <div className="sm:hidden mt-2 pb-2">
          <div className="relative">
            <Search className={cn(
              "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
              isSearchFocused ? "text-mmp-primary" : "text-gray-400"
            )} />
            <Input
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-gray-300 focus:border-mmp-primary focus:ring-mmp-primary"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};