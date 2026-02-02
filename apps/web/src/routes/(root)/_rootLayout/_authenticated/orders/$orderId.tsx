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
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ErrorState } from '@/components/ui/error-state'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/lib/utils'
import { orderQuery } from '@/api/queries/order.query'
import { useCancelOrder, useInitPayment } from '@/api/mutations'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { OrderTimeline } from '@/components/orders/order-timeline'
import {
  ArrowLeft,
  Package,
  Truck,
  Download,
  Printer,
  MessageSquare,
  CreditCard,
  MapPin,
  User,
  Phone,
  Share2,
  Copy,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { OrderStatus } from '@/types'
import { LoadingState } from '@/components/ui/loading-state'
import { useOrderQuery } from '@/api/hooks'
import { ConfirmToast } from '@/components/ui/cofirm-toast'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute(
  '/(root)/_rootLayout/_authenticated/orders/$orderId',
)({
  component: OrderDetailPage,
  loader: async ({ context, params }) => {
    try {
      const order = await context.queryClient.fetchQuery(
        orderQuery(params.orderId),
      )
      return { order }
    } catch (error) {
      console.error('Failed to load order:', error)
      throw error
    }
  },
  pendingComponent: () => <LoadingState message="Loading order details..." />,
  errorComponent: ({ error, reset }) => (
    <ErrorState title="Failed to load order" error={error} onRetry={reset} />
  ),
})

function OrderDetailPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  const loaderData = Route.useLoaderData()
  const { mutateAsync: initPayment, isPending: isInitializingPayment } =
    useInitPayment()

  // Use initial data from loader
  const initialOrder = loaderData.order

  // Fetch fresh data with React Query
  const {
    data: order = initialOrder,
    isLoading,
    error,
    refetch,
  } = useOrderQuery(params.orderId)

  // Cancel order mutation
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder()

  // Handle copy order number
  const handleCopyOrderNumber = React.useCallback(() => {
    if (order) {
      navigator.clipboard
        .writeText(order.orderNumber)
        .then(() => {
          toast.success('Order number copied to clipboard')
        })
        .catch(() => {
          toast.error('Failed to copy order number')
        })
    }
  }, [order])

  // Handle print order
  const handlePrintOrder = React.useCallback(() => {
    window.print()
  }, [])

  // Handle share order
  const handleShareOrder = React.useCallback(async () => {
    if (!order) return

    const shareData = {
      title: `Order #${order.orderNumber}`,
      text: `Check out my order on FashionKet`,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        toast.success('Order shared successfully')
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Order link copied to clipboard')
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share order')
      }
    }
  }, [order])

  // Handle cancel order
  const handleCancelOrder = React.useCallback(() => {
    return toast.info(
      <ConfirmToast
        message="You are about to cancel this order"
        onConfirm={() =>
          cancelOrder(
            { id: order._id },
            {
              onSuccess: (data) => {
                toast.success(data.message || 'Order cancelled successfully')
                refetch()
              },
              onError: (error: any) => {
                toast.error(error.message || 'Failed to cancel order')
              },
            },
          )
        }
      />,
      {
        autoClose: false,
      },
    )
  }, [order, cancelOrder, refetch])

  // Handle download invoice
  const handleDownloadInvoice = React.useCallback(() => {
    toast.info('Invoice download started')
  }, [])

  const handleCompletePayment = React.useCallback(async () => {
    try {
      const paymentData = await initPayment({
        orderId: order._id,
        callbackUrl: `${window.location.origin}/cart/payment-status`,
      })
      // Step 3: Redirect to payment gateway
      console.log('🌐 Redirecting to payment gateway...')
      window.location.href = paymentData.authorization_url
    } catch (error: any) {
      console.error('❌ Order creation failed:', error)
      toast.error(error.message || 'Failed to process order, please try again')
    }
  }, [])
  // Handle retry loading
  const handleRetry = React.useCallback(() => {
    refetch()
  }, [refetch])

  // Show loading state for subsequent loads
  if (isLoading && !initialOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrderDetailHeader loading />
        <div className="container mx-auto px-4 py-8">
          <OrderDetailLoadingSkeleton />
        </div>
      </div>
    )
  }

  // Show error state for subsequent errors
  if (error && !initialOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrderDetailHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <ErrorState
              title="Failed to load order"
              error={error}
              onRetry={handleRetry}
              fullScreen={false}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrderDetailHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <ErrorState
              title="Order not found"
              message="The order you're looking for doesn't exist or you don't have permission to view it."
              onRetry={() => navigate({ to: '/orders' })}
              fullScreen={false}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <OrderDetailHeader order={order} />

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Order Actions */}
            <OrderActions
              order={order}
              onCopyOrderNumber={handleCopyOrderNumber}
              onPrintOrder={handlePrintOrder}
              onShareOrder={handleShareOrder}
            />

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
                <CardDescription>Track your order progress</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderTimeline order={order} />
              </CardContent>
            </Card>

            {/* Order Items */}
            <OrderItems order={order} />

            {/* Order Details */}
            <OrderDetails order={order} />

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Summary */}
            <OrderSummary order={order} />

            {/* Actions */}
            <OrderActionsPanel
              order={order}
              isCancelling={isCancelling}
              onCancelOrder={handleCancelOrder}
              onDownloadInvoice={handleDownloadInvoice}
              onCompletePayment={handleCompletePayment}
              isLoadingPayment={isInitializingPayment}
            />

            {/* Need Help? */}
            <HelpCard />

            {/* Return Policy */}
            <ReturnPolicyCard />
          </div>
        </div>
      </div>
    </div>
  )
}

// Header Component
function OrderDetailHeader({
  order,
  loading = false,
}: {
  order?: any
  loading?: boolean
}) {
  return (
    <div className="bg-gradient-to-r from-mmp-primary to-mmp-primary2 print:bg-white print:text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-white/90 hover:text-white hover:bg-white/20 print:hidden"
              asChild
            >
              <Link to="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
            {loading ? (
              <>
                <Skeleton className="h-10 w-48 mb-2 bg-white/20" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-32 bg-white/20" />
                  <Skeleton className="h-6 w-20 rounded-full bg-white/20" />
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-white mb-2 print:text-black">
                  Order Details
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-white/80 print:text-gray-600">
                    #{order.orderNumber}
                  </p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-12 w-32 bg-white/20 rounded-full" />
          ) : (
            <Badge className="bg-white text-mmp-primary text-lg px-4 py-2 print:bg-gray-100 print:text-gray-800">
              {formatCurrency(order.totalAmount)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

// Order Actions Component
function OrderActions({
  order,
  onCopyOrderNumber,
  onPrintOrder,
  onShareOrder,
}: {
  order: any
  onCopyOrderNumber: () => void
  onPrintOrder: () => void
  onShareOrder: () => void
}) {
  return (
    <Card className="print:hidden">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onCopyOrderNumber}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Order Number
          </Button>
          <Button variant="outline" onClick={onPrintOrder}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button variant="outline" onClick={onShareOrder}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Order
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
          {order.status === OrderStatus.SHIPPED && (
            <Button variant="outline">
              <Truck className="mr-2 h-4 w-4" />
              Track Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Order Items Component
function OrderItems({ order }: { order: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Items ({order.items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.items.map((item: any, index: number) => (
            <div
              key={`${item.productId}-${index}`}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {item.nameSnapshot}
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Qty: {item.quantity} × {formatCurrency(item.priceSnapshot)}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Order Details Component
function OrderDetails({ order }: { order: any }) {
  return (
    <Tabs defaultValue="shipping" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
        <TabsTrigger value="payment">Payment Information</TabsTrigger>
      </TabsList>

      <TabsContent value="shipping">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {order.addressId.fullName || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{order.addressId.phone || 'N/A'}</span>
              </div>
              <div className="text-gray-600 space-y-1">
                <p>{order.addressId.addressLine1}</p>
                {order.addressId.addressLine2 && (
                  <p>{order.addressId.addressLine2}</p>
                )}
                <p>
                  {order.addressId.city}, {order.addressId.state}{' '}
                  {order.addressId.postalCode}
                </p>
                <p>{order.addressId.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payment">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Payment Status</div>
                <div className="font-medium">
                  {order.paidAt ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Paid</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <Clock className="h-4 w-4" />
                      <span>Pending</span>
                    </div>
                  )}
                </div>
                {order.paidAt && (
                  <div className="text-sm text-gray-600 mt-1">
                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{formatCurrency(order.shippingFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-mmp-primary2">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// Order Summary Component
function OrderSummary({ order }: { order: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number</span>
            <span className="font-mono text-sm">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order Date</span>
            <span>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>
          {order.trackingNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking</span>
              <span className="font-mono text-sm">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Items</span>
            <span>{order.items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(order.subtotalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{formatCurrency(order.shippingFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-mmp-primary2">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Order Actions Panel Component
function OrderActionsPanel({
  order,
  isCancelling,
  onCancelOrder,
  onDownloadInvoice,
  onCompletePayment,
  isLoadingPayment,
}: {
  order: any
  isCancelling: boolean
  onCancelOrder: () => void
  onDownloadInvoice: () => void
  onCompletePayment: () => void
  isLoadingPayment: boolean
}) {
  const isCancellable = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
  ].includes(order.status)

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle>Order Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {order.status === OrderStatus.PENDING_PAYMENT && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={onCompletePayment}
          >
            {isLoadingPayment ? (
              <>
                <Spinner />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Complete Payment
              </>
            )}
          </Button>
        )}

        {order.status === OrderStatus.PROCESSING && (
          <Button variant="outline" className="w-full">
            <Truck className="mr-2 h-4 w-4" />
            Track Shipment
          </Button>
        )}

        {order.status === OrderStatus.DELIVERED && (
          <Button variant="outline" className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Leave Review
          </Button>
        )}

        {isCancellable && (
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onCancelOrder}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={onDownloadInvoice}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>
      </CardContent>
    </Card>
  )
}

// Help Card Component
function HelpCard() {
  const PhoneIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  )

  const MailIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle>Need Help?</CardTitle>
        <CardDescription>We're here to assist you</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/contact">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with Support
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <a href="tel:0700FASHION">
              <PhoneIcon className="mr-2 h-4 w-4" />
              Call Support
            </a>
          </Button>
          <div className="text-sm text-gray-600 pt-3 space-y-1">
            <p className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              <span>support@fashionket.com</span>
            </p>
            <p className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              <span>0700-FASHION</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Return Policy Card Component
function ReturnPolicyCard() {
  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle>Return Policy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Eligible for returns within 14 days</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Items must be in original condition</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Refunds processed in 5-7 business days</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Contact support for return authorization</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading Skeleton Component
function OrderDetailLoadingSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-8 space-y-8">
        {/* Actions Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-28 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-4 w-4 rounded-full mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Items Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Skeleton */}
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
