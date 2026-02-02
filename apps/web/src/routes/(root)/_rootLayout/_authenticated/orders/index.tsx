import React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { formatCurrency } from '@/lib/utils'
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  RefreshCw,
  ShoppingBag,
  Eye,
  DollarSign,
  Truck as TruckIcon,
  CheckCircle2,
} from 'lucide-react'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { OrderStatus, type IOrderListItem } from '@/types'
import { z } from 'zod'
import { ordersQuery, orderStatsQuery } from '@/api/queries/order.query'
import { LoadingState } from '@/components/ui/loading-state'
import { useOrdersQuery, useOrderStatsQuery } from '@/api/hooks'

// Search validation schema
const ordersSearchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
  status: z.nativeEnum(OrderStatus).optional(),
})

export const Route = createFileRoute('/(root)/_rootLayout/_authenticated/orders/')({
  component: OrdersPage,
  validateSearch: ordersSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    limit: search.limit,
  }),
  loader: async ({ context, deps }) => {
    const queryClient = context.queryClient
    
    try {
      // Fetch initial data in loader (best practice)
      const [orders, stats] = await Promise.all([
        queryClient.fetchQuery(
          ordersQuery({
            page: deps.page,
            limit: deps.limit,
          })
        ),
        queryClient.fetchQuery(orderStatsQuery()),
      ])
      
      return {
        initialOrders: orders,
        initialStats: stats,
        page: deps.page,
        limit: deps.limit,
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
      throw error
    }
  },
  pendingComponent: () => <LoadingState message="Loading your orders..." />,
  errorComponent: ({ error }) => (
    <ErrorState 
      title="Failed to load orders"
      error={error}
      retryText="Retry"
    />
  ),
})

function OrdersPage() {
  const loaderData = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })
  
  // Use initial data from loader
  const initialOrders = loaderData.initialOrders
  const initialStats = loaderData.initialStats
  
  // Get search params
  const search = Route.useSearch()
  
  // Fetch fresh data with React Query (for real-time updates)
  const {
    data: ordersData = initialOrders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrdersQuery({
    page: search.page,
    limit: search.limit,
    status: search.status,
  })

  const {
    data: stats = initialStats,
    isLoading: statsLoading,
    error: statsError,
  } = useOrderStatsQuery()

  // Handle search param updates
  const updateSearchParams = React.useCallback(
    (updates: Partial<z.infer<typeof ordersSearchSchema>>) => {
      navigate({
        search: (prev) => ({
          ...prev,
          ...updates,
        }),
      })
    },
    [navigate]
  )

  // Handle status filter change
  const handleStatusFilter = React.useCallback(
    (status: OrderStatus | 'all') => {
      updateSearchParams({
        status: status === 'all' ? undefined : status,
        page: 1, // Reset to first page when changing filters
      })
    },
    [updateSearchParams]
  )

  // Handle page change
  const handlePageChange = React.useCallback(
    (page: number) => {
      updateSearchParams({ page })
    },
    [updateSearchParams]
  )

  // Handle retry
  const handleRetry = React.useCallback(() => {
    window.location.reload()
  }, [])

  const orders = ordersData?.data || []
  const paginationMeta = ordersData?.pagination

  // Status filters
  const statusFilters = React.useMemo(() => {
    const filters = [
      {
        value: 'all' as const,
        label: 'All Orders',
        icon: Package,
        count: stats?.total,
      },
      {
        value: OrderStatus.PENDING_PAYMENT,
        label: 'Pending Payment',
        icon: Clock,
        count: stats?.byStatus?.PENDING_PAYMENT?.count,
      },
      {
        value: OrderStatus.PENDING,
        label: 'Pending',
        icon: Clock,
        count: stats?.byStatus?.PENDING?.count,
      },
      {
        value: OrderStatus.PROCESSING,
        label: 'Processing',
        icon: RefreshCw,
        count: stats?.byStatus?.PROCESSING?.count,
      },
      {
        value: OrderStatus.SHIPPED,
        label: 'Shipped',
        icon: TruckIcon,
        count: stats?.byStatus?.SHIPPED?.count,
      },
      {
        value: OrderStatus.DELIVERED,
        label: 'Delivered',
        icon: CheckCircle2,
        count: stats?.byStatus?.DELIVERED?.count,
      },
      {
        value: OrderStatus.CANCELLED,
        label: 'Cancelled',
        icon: Clock,
        count: stats?.byStatus?.CANCELLED?.count,
      },
    ]

    return filters.filter(filter => filter.count !== undefined || filter.value === 'all')
  }, [stats])

  // Show loading state for subsequent loads
  if ((ordersLoading || statsLoading) && !orders.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrdersHeader loading />
        <div className="container mx-auto px-4 py-8">
          <OrdersLoadingSkeleton />
        </div>
      </div>
    )
  }

  // Show error state for subsequent errors
  if ((ordersError || statsError) && !orders.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrdersHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <ErrorState
              title="Failed to load orders"
              error={ordersError || statsError}
              onRetry={handleRetry}
              fullScreen={false}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <OrdersHeader stats={stats} />

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Stats Overview */}
            <OrdersStats stats={stats} />

            {/* Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order History
                </h2>
                <span className="text-sm text-gray-600">
                  {paginationMeta?.total || 0} orders
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      search.status === filter.value ||
                      (filter.value === 'all' && !search.status)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleStatusFilter(filter.value)}
                    className={
                      search.status === filter.value ||
                      (filter.value === 'all' && !search.status)
                        ? 'bg-mmp-primary hover:bg-mmp-primary2'
                        : ''
                    }
                    disabled={filter.count === 0 && filter.value !== 'all'}
                  >
                    <filter.icon className="mr-2 h-4 w-4" />
                    {filter.label}
                    {filter.count !== undefined && filter.count > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-white/20 text-white"
                      >
                        {filter.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <OrdersList 
              orders={ordersData.data}
              searchStatus={search.status} 
              statusFilters={statusFilters} 
            />

            {/* Pagination */}
            {paginationMeta && paginationMeta.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  meta={paginationMeta}
                  onPageChange={handlePageChange}
                  showInfo
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <OrdersSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

// Header Component
function OrdersHeader({ stats, loading = false }: { stats?: any; loading?: boolean }) {
  return (
    <div className="bg-gradient-to-r from-mmp-primary to-mmp-primary2">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-white/90 hover:text-white hover:bg-white/20"
              asChild
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">My Orders</h1>
            <p className="text-white/80">Track and manage your purchases</p>
          </div>
          {loading ? (
            <Skeleton className="h-12 w-32 bg-white/20 rounded-full" />
          ) : (
            <Badge className="bg-white text-mmp-primary text-lg px-4 py-2">
              {stats?.total || 0} Orders
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

// Stats Component
function OrdersStats({ stats }: { stats?: any }) {
  const statItems = [
    {
      label: 'Total Orders',
      value: stats?.total || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Processing',
      value: stats?.byStatus?.PROCESSING?.count || 0,
      icon: RefreshCw,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      label: 'Delivered',
      value: stats?.byStatus?.DELIVERED?.count || 0,
      icon: CheckCircle2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-base md:text-lg font-bold ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-[10px] md:text-sm text-gray-600">{item.label}</div>
              </div>
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Orders List Component
function OrdersList({ 
  orders, 
  searchStatus, 
  statusFilters 
}: { 
  orders: IOrderListItem[]
  searchStatus?: OrderStatus
  statusFilters: any[]
}) {
  if (orders.length === 0) {
    const currentStatus = statusFilters.find(s => s.value === searchStatus)
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              {!searchStatus
                ? "You haven't placed any orders yet."
                : `No orders with status "${currentStatus?.label}" found.`}
            </p>
            <Button asChild className="bg-mmp-primary hover:bg-mmp-primary2">
              <Link to="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Start Shopping
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  )
}

// Order Card Component
function OrderCard({ order }: { order: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Order Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                {order.itemCount}{' '}
                {order.itemCount === 1 ? 'item' : 'items'} • Total:{' '}
                {formatCurrency(order.totalAmount)}
              </div>
              {order.paidAt && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>
                    Paid on{' '}
                    {new Date(order.paidAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders/$orderId" params={{ orderId: order._id }}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
            {order.status === OrderStatus.SHIPPED && (
              <Button variant="outline" size="sm">
                <Truck className="mr-2 h-4 w-4" />
                Track Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Sidebar Component
function OrdersSidebar() {
  const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )

  const MailIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  return (
    <div className="sticky top-8 space-y-6">
      {/* Order Status Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Status Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm">Pending Payment - Awaiting payment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm">Processing - Order confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm">Shipped - On its way</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm">Delivered - Order received</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm">Cancelled - Order cancelled</span>
          </div>
        </CardContent>
      </Card>

      {/* Need Help? */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>Contact our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              <span>Call: 0701-726-2642</span>
            </li>
            <li className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              <span>Email: support@fashionket.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Live Chat: Available 24/7</span>
            </li>
          </ul>
          <Button variant="default" className="w-full mt-4" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Return Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Return Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 14-day return window</p>
            <p>• Items must be unworn with tags</p>
            <p>• Free returns for defective items</p>
            <p>• Refunds processed in 5-7 business days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading Skeleton Component
function OrdersLoadingSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-9">
        {/* Stats Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Skeletons */}
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* Order List Skeletons */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-28 rounded-md" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <div className="lg:col-span-3 mt-8 lg:mt-0">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                {i === 1 && <Skeleton className="h-4 w-40 mt-2" />}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                {i === 1 && <Skeleton className="h-9 w-full mt-4" />}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Missing icon component
const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)