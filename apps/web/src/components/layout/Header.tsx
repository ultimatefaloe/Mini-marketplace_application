import { useState, useEffect, useMemo } from 'react'
import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import {
  Menu,
  ShoppingCart,
  Search,
  User,
  Sparkles,
  Home,
  Package,
  Tag,
  Store,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Heart,
  Settings,
  CreditCard,
  Shield,
  Bell,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks'
import { useCart, useLogout } from '@/api'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

// Navigation links configuration
const navLinks = [
  { href: '/', title: 'Home', icon: Home },
  { href: '/categories', title: 'Categories', icon: Tag },
  { href: '/products', title: 'Products', icon: Package },
  // { href: '/new-arrivals', title: 'New Arrivals', icon: Sparkles },
]

const userLinks = [
  { href: '/account', title: 'My Profile', icon: User },
  { href: '/account/orders', title: 'My Orders', icon: Package },
  { href: '/account/wishlist', title: 'Wishlist', icon: Heart },
  { href: '/account/settings', title: 'Settings', icon: Settings },
]

const adminLinks = [
  { href: '/admin', title: 'Dashboard', icon: TrendingUp },
  { href: '/admin/products', title: 'Products', icon: Package },
  { href: '/admin/orders', title: 'Orders', icon: ShoppingBag },
  { href: '/admin/analytics', title: 'Analytics', icon: CreditCard },
]

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouterState()
  const navigate = useNavigate()

  const { user, isAuthenticated, isLoading, isAdmin, isUser, logout } =
    useAuth()
  const { data: cartData, isLoading: isLoadingCart } = useCart()
  const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout()

  const cartItems = cartData?.items?.length || 0
  const cartTotal = useMemo(() => {
    return cartData?.items?.reduce(
      (total, item) => total + (item.priceSnapshot ?? 0),
      0,
    ) || 0
  }, [cartData?.items])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check active route
  const isActive = (href: string) => {
    return router.location.pathname === href
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate({ to: '/search', search: { q: searchQuery } })
      setIsSearchExpanded(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleAdminDashboard = () => {
    navigate({ to: '/admin' })
  }

  // User initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return 'U'
    return user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // User display name
  const getUserDisplayName = () => {
    if (!user?.fullName) return 'Welcome!'
    return user.fullName.split(' ')[0]
  }

  return (
    <>
      {/* Premium Announcement Bar */}
      <div className="bg-gradient-to-r from-mmp-primary to-mmp-accent text-white py-2 px-4 overflow-hidden relative">
        <div className="container mx-auto flex justify-center items-center">
          <div className="flex items-center gap-2 animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-sm font-medium tracking-wide">
              ✨ Exclusive Launch: New Collection Live Now
            </span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex ml-4 text-xs h-6 px-2 bg-white/20 hover:bg-white/30"
            asChild
          >
            <Link to="/products">Shop Now</Link>
          </Button>
        </div>

        {/* Animated border effect */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-mmp-primary2/95 backdrop-blur-md shadow-2xl'
            : 'bg-mmp-primary2'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center gap-3 md:gap-6">
              {/* Mobile Menu Button */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden hover:bg-mmp-primary/20 p-2"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5 text-mmp-neutral" />
                  </Button>
                </SheetTrigger>

                {/* Mobile Navigation */}
                <SheetContent
                  side="left"
                  className="w-[85vw] max-w-md p-0 bg-mmp-primary2 border-r border-mmp-primary/30"
                >
                  <SheetHeader className="p-6 border-b border-mmp-primary/30">
                    <SheetTitle className="text-center">
                      <Link
                        to="/"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-2 group"
                      >
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-mmp-neutral tracking-tight">
                            FashionKet
                          </span>
                          <span className="text-xs text-mmp-secondary font-medium">
                            Premium Shopping
                          </span>
                        </div>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="p-6 overflow-y-auto h-[calc(100vh-120px)]">
                    {/* User Info Section */}
                    {isAuthenticated ? (
                      <div className="flex gap-2 items-center mb-6">
                        <Link
                          to="/account"
                          onClick={() => setIsSidebarOpen(false)}
                          className="flex items-center gap-3 p-4 bg-mmp-primary/10 rounded-xl flex-1"
                        >
                          <Avatar className="w-12 h-12 ring-2 ring-white/20">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-mmp-accent to-mmp-secondary text-white">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-mmp-neutral">
                              {getUserDisplayName()}
                            </p>
                            <p className="text-sm text-mmp-secondary">
                              {user?.email}
                            </p>
                          </div>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="bg-red-600/20 hover:bg-red-600/30"
                        >
                          <LogOut className="h-5 w-5 text-red-400" />
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <Button
                          variant="outline"
                          className="border-mmp-primary/30 hover:bg-mmp-primary/10 h-11"
                          asChild
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          <Link to="/login">Login</Link>
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90 h-11"
                          asChild
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          <Link to="/signup">Register</Link>
                        </Button>
                      </div>
                    )}

                    {/* Admin Section */}
                    {isAdmin && (
                      <>
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-mmp-secondary/80 uppercase tracking-wider mb-2">
                            Admin Panel
                          </h3>
                          <nav className="space-y-1">
                            {adminLinks.map((link) => {
                              const Icon = link.icon
                              return (
                                <Link
                                  key={link.href}
                                  to={link.href}
                                  onClick={() => setIsSidebarOpen(false)}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-mmp-primary/10 transition-colors"
                                >
                                  <Icon className="h-5 w-5 text-mmp-secondary" />
                                  <span className="text-mmp-neutral">
                                    {link.title}
                                  </span>
                                </Link>
                              )
                            })}
                          </nav>
                        </div>
                        <Separator className="my-4 bg-mmp-primary/30" />
                      </>
                    )}

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                      {navLinks.map((link) => {
                        const Icon = link.icon
                        const active = isActive(link.href)
                        return (
                          <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all group ${
                              active
                                ? 'bg-gradient-to-r from-mmp-primary/30 to-mmp-accent/20 border-l-4 border-mmp-secondary'
                                : 'hover:bg-mmp-primary/10'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-2 rounded-lg ${
                                  active
                                    ? 'bg-mmp-secondary text-white'
                                    : 'bg-mmp-primary/20 text-mmp-neutral'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <span
                                className={`font-medium ${
                                  active
                                    ? 'text-mmp-secondary'
                                    : 'text-mmp-neutral'
                                }`}
                              >
                                {link.title}
                              </span>
                            </div>
                            <ChevronRight
                              className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                                active
                                  ? 'text-mmp-secondary'
                                  : 'text-mmp-neutral/60'
                              }`}
                            />
                          </Link>
                        )
                      })}
                    </nav>

                    {/* User Links for authenticated users */}
                    {isAuthenticated && (
                      <>
                        <Separator className="my-6 bg-mmp-primary/30" />
                        <nav className="space-y-1">
                          {userLinks.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.href)
                            return (
                              <Link
                                key={link.href}
                                to={link.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                  active
                                    ? 'bg-mmp-primary/20 text-mmp-secondary'
                                    : 'hover:bg-mmp-primary/10 text-mmp-neutral'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <span>{link.title}</span>
                              </Link>
                            )
                          })}
                        </nav>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-mmp-accent to-mmp-secondary rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
                  <div className="relative p-2 bg-mmp-primary2 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-mmp-secondary" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-mmp-neutral via-mmp-secondary to-mmp-accent bg-clip-text text-transparent">
                    FashionKet
                  </span>
                  <span className="text-xs text-mmp-secondary font-medium hidden md:block">
                    Curated Excellence
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <nav className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`relative px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                        active
                          ? 'text-mmp-secondary [&.active]:after:content-[""] [&.active]:after:absolute [&.active]:after:bottom-0 [&.active]:after:left-1/2 [&.active]:after:-translate-x-1/2 [&.active]:after:w-1/2 [&.active]:after:h-0.5 [&.active]:after:bg-gradient-to-r [&.active]:after:from-mmp-accent [&.active]:after:to-mmp-secondary'
                          : 'text-mmp-neutral/80 hover:text-mmp-secondary'
                      }`}
                      activeProps={{ className: 'active' }}
                    >
                      {link.title}
                      {active && (
                        <span className="absolute -top-1 -right-1">
                          <div className="relative">
                            <div className="absolute animate-ping h-2 w-2 rounded-full bg-mmp-secondary/40" />
                            <div className="relative h-2 w-2 rounded-full bg-mmp-secondary" />
                          </div>
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Search - Adaptive */}
              {isSearchExpanded ? (
                <div className="absolute top-0 left-0 right-0 z-30 h-16 bg-mmp-primary2/95 backdrop-blur-md px-4 flex items-center md:relative md:top-auto md:left-auto md:right-auto md:h-auto md:bg-transparent">
                  <div className="flex-1 relative max-w-2xl mx-auto">
                    <form onSubmit={handleSearch}>
                      <Input
                        type="search"
                        placeholder="Discover premium products..."
                        className="w-full pl-12 pr-20 h-12 bg-mmp-primary/20 border-mmp-primary/40 focus:border-mmp-secondary focus:ring-mmp-secondary/20 rounded-xl text-mmp-neutral placeholder:text-mmp-neutral/60"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mmp-secondary" />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-mmp-neutral/60 hover:text-mmp-neutral"
                          onClick={() => setIsSearchExpanded(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="h-8 bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90"
                          size="sm"
                        >
                          Search
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Search */}
                  <div className="hidden md:flex items-center relative">
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="search"
                        placeholder="Search..."
                        className="w-[180px] lg:w-[220px] pl-10 pr-4 h-10 bg-mmp-primary/20 border-mmp-primary/40 focus:border-mmp-secondary focus:ring-mmp-secondary/20 rounded-xl text-mmp-neutral placeholder:text-mmp-neutral/60"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mmp-secondary" />
                    </form>
                  </div>

                  {/* Mobile Search Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden hover:bg-mmp-primary/20"
                    aria-label="Search"
                    onClick={() => setIsSearchExpanded(true)}
                  >
                    <Search className="h-5 w-5 text-mmp-neutral" />
                  </Button>
                </>
              )}

              {/* Shopping Cart */}
              {isUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-mmp-primary/20 relative group"
                      aria-label="Shopping cart"
                      disabled={isLoadingCart}
                    >
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-mmp-primary/30 to-mmp-accent/20 group-hover:from-mmp-accent/30 group-hover:to-mmp-secondary/20 transition-all">
                        {isLoadingCart ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-mmp-neutral border-t-transparent" />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-mmp-neutral" />
                        )}
                      </div>
                      {cartItems > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-mmp-accent to-mmp-secondary text-white text-xs h-5 w-5 p-0 flex items-center justify-center border-2 border-mmp-primary2">
                          {cartItems > 99 ? '99+' : cartItems}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80 bg-mmp-primary2 border-mmp-primary/30"
                  >
                    <DropdownMenuLabel className="text-mmp-neutral">
                      <div className="flex items-center justify-between">
                        <span>Your Cart ({cartItems} items)</span>
                        <span className="text-sm text-mmp-secondary font-semibold">
                          {formatCurrency(cartTotal)}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-mmp-primary/30" />
                    <div className="p-3">
                      {cartItems === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="h-12 w-12 text-mmp-primary/30 mx-auto mb-3" />
                          <p className="text-mmp-neutral/60">
                            Your cart is empty
                          </p>
                          <Button
                            className="mt-4 bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90"
                            asChild
                          >
                            <Link to="/products">Start Shopping</Link>
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {cartData?.items?.slice(0, 3).map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-mmp-primary/10 transition-colors"
                              >
                                <div className="w-12 h-12 bg-gradient-to-br from-mmp-primary/20 to-mmp-accent/10 rounded-lg flex items-center justify-center">
                                  <Package className="h-6 w-6 text-mmp-secondary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-mmp-neutral truncate">
                                    {item.product?.name || `Product ${item.id}`}
                                  </p>
                                  <p className="text-xs text-mmp-neutral/60">
                                    Qty: {item.quantity} × $
                                    {item.price?.toFixed(2)}
                                  </p>
                                </div>
                                <span className="font-semibold text-mmp-secondary">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {cartItems > 3 && (
                            <div className="text-center mt-2">
                              <p className="text-sm text-mmp-neutral/60">
                                +{cartItems - 3} more items
                              </p>
                            </div>
                          )}
                          <div className="mt-4 pt-3 border-t border-mmp-primary/30">
                            <Button
                              className="w-full bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90 h-11"
                              asChild
                            >
                              <Link to="/cart">View Cart & Checkout</Link>
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Notifications (for authenticated users) */}
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-mmp-primary/20 relative group"
                      aria-label="Notifications"
                    >
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-mmp-primary/30 to-mmp-accent/20 group-hover:from-mmp-accent/30 group-hover:to-mmp-secondary/20 transition-all">
                        <Bell className="h-5 w-5 text-mmp-neutral" />
                      </div>
                      <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center border-2 border-mmp-primary2">
                        3
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-mmp-primary2 border-mmp-primary/30"
                  >
                    <DropdownMenuLabel className="text-mmp-neutral">
                      Notifications
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-mmp-primary/30" />
                    <div className="p-2">
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-mmp-primary/10">
                          <p className="text-sm font-medium text-mmp-neutral">
                            Order Shipped
                          </p>
                          <p className="text-xs text-mmp-neutral/60">
                            Your order #12345 has been shipped
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Account / Auth Buttons */}
              {!isAuthenticated ? (
                <div className="hidden lg:flex gap-3 ml-4">
                  <Button
                    variant="outline"
                    className="px-5 border-mmp-primary/30 hover:bg-mmp-primary/10"
                    asChild
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button
                    className="px-5 bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90"
                    asChild
                  >
                    <Link to="/signup">Register</Link>
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hover:bg-mmp-primary/20 px-3 rounded-full"
                      aria-label="User account"
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-mmp-accent to-mmp-secondary text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline text-mmp-neutral font-medium">
                        {getUserDisplayName()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-mmp-primary2 border-mmp-primary/30"
                  >
                    <DropdownMenuLabel className="text-mmp-neutral">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-br from-mmp-accent to-mmp-secondary text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user?.fullName}</p>
                          <p className="text-xs text-mmp-neutral/60">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-mmp-primary/30" />

                    {/* Admin Quick Access */}
                    {isAdmin && (
                      <>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="text-mmp-neutral hover:bg-mmp-primary/20 focus:bg-mmp-primary/20 cursor-pointer"
                            onClick={handleAdminDashboard}
                          >
                            <Shield className="h-4 w-4 text-mmp-secondary mr-2" />
                            <span>Admin Dashboard</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-mmp-primary/30" />
                      </>
                    )}

                    {/* User Links */}
                    <DropdownMenuGroup>
                      {userLinks.map((link) => {
                        const Icon = link.icon
                        return (
                          <DropdownMenuItem
                            key={link.href}
                            asChild
                            className="text-mmp-neutral hover:bg-mmp-primary/20 focus:bg-mmp-primary/20 cursor-pointer"
                          >
                            <Link
                              to={link.href}
                              className="flex items-center gap-2"
                            >
                              <Icon className="h-4 w-4 text-mmp-secondary" />
                              <span>{link.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="bg-mmp-primary/30" />

                    <DropdownMenuItem
                      className="text-red-400 hover:bg-red-600/10 focus:bg-red-600/10 cursor-pointer"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
