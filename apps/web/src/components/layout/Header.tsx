import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  User,
  Sparkles,
  Home,
  Package,
  Tag,
  Store,
  ChevronRight,
  Star,
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
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

// Navigation links configuration
const navLinks = [
  { href: '/', title: 'Home', icon: Home },
  { href: '/categories', title: 'Categories', icon: Tag },
  { href: '/products', title: 'Products', icon: Package },
  { href: '/shop', title: 'Shop', icon: Store },
]

const userLinks = [
  { href: '/profile', title: 'My Profile', icon: User },
  { href: '/orders', title: 'My Orders', icon: Package },
  { href: '/settings', title: 'Settings', icon: Sparkles },
]

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const cartItems = 5
  const router = useRouterState()

  // Check active route
  const isActive = (href: string) => {
    return router.location.pathname === href
  }

  const onSearchHandler = () => {
    console.log(searchQuery)
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
          >
            Shop Now
          </Button>
        </div>

        {/* Animated border effect */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-mmp-primary2 shadow-2xl">
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
                        {/* <div className="p-2 bg-gradient-to-br from-mmp-accent to-mmp-secondary rounded-lg group-hover:scale-105 transition-transform">
                          <ShoppingBag className="h-6 w-6 text-white" />
                        </div> */}
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

                  {/* User Quick Actions */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 p-4 bg-mmp-primary/10 rounded-xl mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-mmp-accent to-mmp-secondary rounded-full flex items-center justify-center ring-2 ring-white/20">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-mmp-neutral">
                          Welcome Back!
                        </p>
                        <p className="text-sm text-mmp-secondary">
                          Access exclusive deals
                        </p>
                      </div>
                    </div>

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

                    <Separator className="my-6 bg-mmp-primary/30" />

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="border-mmp-primary/30 hover:bg-mmp-primary/10 h-11"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Account
                      </Button>
                      <Button className="bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90 h-11">
                        <Star className="h-4 w-4 mr-2" />
                        Deals
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                {/* <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-mmp-accent to-mmp-secondary rounded-xl blur group-hover:blur-lg transition-all duration-300 opacity-70" />
                  <div className="relative p-2 bg-mmp-primary2 rounded-xl border border-mmp-primary/30">
                    <ShoppingBag className="h-7 w-7 md:h-8 md:w-8 text-mmp-secondary" />
                  </div>
                </div> */}
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
                <div className="absolute top-0 left-0 right-0 z-30 h-16 bg-mmp-primary2 px-4 flex items-center md:relative md:top-auto md:left-auto md:right-auto md:h-auto md:bg-transparent">
                  <div className="flex-1 relative max-w-2xl mx-auto">
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
                        variant="ghost"
                        size="sm"
                        className="text-mmp-neutral/60 hover:text-mmp-neutral"
                        onClick={() => setIsSearchExpanded(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={onSearchHandler}
                        className="h-8 bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90"
                        size="sm"
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop Search */}
                  <div className="hidden md:flex items-center relative">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-[180px] lg:w-[220px] pl-10 pr-4 h-10 bg-mmp-primary/20 border-mmp-primary/40 focus:border-mmp-secondary focus:ring-mmp-secondary/20 rounded-xl text-mmp-neutral placeholder:text-mmp-neutral/60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchExpanded(true)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mmp-secondary" />
                  </div>

                  {/* Mobile Search Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden hover:bg-mmp-primary/20"
                    aria-label="Search"
                    onClick={() => {
                      setIsSearchExpanded(true);
                      onSearchHandler
                    }}
                  >
                    <Search className="h-5 w-5 text-mmp-neutral" />
                  </Button>
                </>
              )}

              {/* User Account */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-mmp-primary/20 relative group"
                    aria-label="User account"
                  >
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-mmp-primary/30 to-mmp-accent/20 group-hover:from-mmp-accent/30 group-hover:to-mmp-secondary/20 transition-all">
                      <User className="h-5 w-5 text-mmp-neutral" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-mmp-primary2 border-mmp-primary/30"
                >
                  <DropdownMenuLabel className="text-mmp-neutral">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-mmp-accent to-mmp-secondary rounded-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span>My Account</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-mmp-primary/30" />
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
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Shopping Cart */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-mmp-primary/20 relative group"
                    aria-label="Shopping cart"
                  >
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-mmp-primary/30 to-mmp-accent/20 group-hover:from-mmp-accent/30 group-hover:to-mmp-secondary/20 transition-all">
                      <ShoppingCart className="h-5 w-5 text-mmp-neutral" />
                    </div>
                    {cartItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-mmp-accent to-mmp-secondary text-white text-xs h-5 w-5 p-0 flex items-center justify-center border-2 border-mmp-primary2">
                        {cartItems}
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
                        299.97
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-mmp-primary/30" />
                  <div className="p-3">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-mmp-primary/10 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-mmp-primary/20 to-mmp-accent/10 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-mmp-secondary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-mmp-neutral">
                              Premium Product {item}
                            </p>
                            <p className="text-xs text-mmp-neutral/60">
                              Qty: 1 × #99.99
                            </p>
                          </div>
                          <span className="font-semibold text-mmp-secondary">
                            $99.99
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-mmp-primary/30">
                      <Button className="w-full bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90 h-11">
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
