import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useOrders, useOrderStats } from '@/api/order.query'
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  RefreshCw,
  ShoppingBag,
  Eye,
} from 'lucide-react'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { OrderStatus } from '@/types'
import z from 'zod'

export const Route = createFileRoute(
  '/(root)/_rootLayout/_authenticated/orders/',
)({
  component: OrdersPage,
  validateSearch: z
    .object({
      page: z.number().optional(),
      limit: z.number().optional(),
      status: z.enum(OrderStatus).optional(),
    })
    .transform((s) => ({
      status: s.status,
      page: s.page ?? 1,
      limit: s.limit ?? 20,
    })),
})

function OrdersPage() {
  const search = Route.useSearch()
  const { data: ordersData, isLoading } = useOrders({
    page: search.page,
    limit: 10,
    status: search.status,
  })

  const { data: stats } = useOrderStats()

  const orders = ordersData?.data || []
  const pagination = ordersData?.pagination

  const [selectedStatus, setSelectedStatus] = React.useState<
    OrderStatus | 'all'
  >(search.status || 'all')

  const statusFilters: Array<{
    value: OrderStatus | 'all'
    label: string
    count?: number
  }> = [
    { value: 'all', label: 'All Orders' },
    {
      value: OrderStatus.PENDING_PAYMENT,
      label: 'Pending',
      count: stats?.byStatus?.PENDING_PAYMENT.count,
    },
    {
      value: OrderStatus.PROCESSING,
      label: 'Processing',
      count: stats?.byStatus?.PROCESSING?.count,
    },
    {
      value: OrderStatus.SHIPPED,
      label: 'Shipped',
      count: stats?.byStatus?.SHIPPED?.count,
    },
    {
      value: OrderStatus.DELIVERED,
      label: 'Delivered',
      count: stats?.byStatus?.DELIVERED?.count,
    },
    {
      value: OrderStatus.CANCELLED,
      label: 'Cancelled',
      count: stats?.byStatus?.CANCELLED?.count,
    },
  ]

  const handleStatusFilter = (status: OrderStatus | 'all') => {
    setSelectedStatus(status)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mmp-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <Badge className="bg-white text-mmp-primary text-lg px-4 py-2">
              {stats?.total || 0} Orders
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats?.total || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats?.totalRevenue || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="p-2 rounded-lg bg-green-100">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {stats?.byStatus?.PROCESSING?.count || 0}
                      </div>
                      <div className="text-sm text-gray-600">Processing</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-100">
                      <RefreshCw className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats?.byStatus?.DELIVERED?.count || 0}
                      </div>
                      <div className="text-sm text-gray-600">Delivered</div>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-100">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order History
                </h2>
                <div className="flex items-center gap-2"></div>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      selectedStatus === filter.value ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleStatusFilter(filter.value)}
                    className={
                      selectedStatus === filter.value
                        ? 'bg-mmp-primary hover:bg-mmp-primary2'
                        : ''
                    }
                  >
                    {filter.label}
                    {filter.count !== undefined && (
                      <Badge variant="secondary" className="ml-2">
                        {filter.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="p-2">
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No orders found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {selectedStatus === 'all'
                          ? "You haven't placed any orders yet."
                          : `No orders with status "${selectedStatus}" found.`}
                      </p>
                      <Button
                        asChild
                        className="bg-mmp-primary hover:bg-mmp-primary2"
                      >
                        <Link to="/products">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Start Shopping
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card
                    key={order._id}
                    className="hover:shadow-md transition-shadow"
                  >
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
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              {order.itemCount}{' '}
                              {order.itemCount === 1 ? 'item' : 'items'} •
                              Total: {formatCurrency(order.totalAmount)}
                            </div>
                            {order.paidAt && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                <span>
                                  Paid on{' '}
                                  {new Date(order.paidAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to={`/orders/$slug`}
                              params={{ slug: order._id }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                          {order.status === OrderStatus.PROCESSING && (
                            <Button variant="outline" size="sm">
                              <Truck className="mr-2 h-4 w-4" />
                              Track Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => {
                      // Navigate to previous page
                    }}
                  >
                    Previous
                  </Button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.page === pageNum ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            // Navigate to page
                          }}
                          className={
                            pagination.page === pageNum ? 'bg-mmp-primary' : ''
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    },
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => {
                      // Navigate to next page
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <div className="sticky top-8 space-y-6">
              {/* Order Status Guide */}
              <Card className="p-2">
                <CardHeader>
                  <CardTitle className="text-lg">Order Status Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm">Pending - Awaiting payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm">
                      Processing - Order confirmed
                    </span>
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
              <Card className="p-2">
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                  <CardDescription>Contact our support team</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>📞 Call: 0700-FASHION</li>
                    <li>✉️ Email: support@fashionket.com</li>
                    <li>💬 Live Chat: Available 24/7</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-4">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              {/* Return Policy */}
              <Card className="p-2">
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
          </div>
        </div>
      </div>
    </div>
  )
}
