import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { useOrder } from '@/api/order.query';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { OrderTimeline } from '@/components/orders/order-timeline';
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
  Copy
} from 'lucide-react';
import { toast } from 'react-toastify';
import { OrderStatus } from '@/types';

export const Route = createFileRoute('/(root)/_rootLayout/_authenticated/orders/$slug')({
  component: OrderDetailPage,
  params: {
    parse: (params) => ({
      slug: params.slug,
    }),
  },
  loader: async ({ params }) => {
    // In real implementation, fetch order by ID
    return { orderId: params.slug };
  },
});

function OrderDetailPage() {
  const { slug: orderId } = Route.useParams();
  const { data: orderData, isLoading } = useOrder(orderId);
  
  const order = orderData;
  
  const handleCopyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      toast.success('Order number copied to clipboard');
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleShareOrder = () => {
    if (navigator.share && order) {
      navigator.share({
        title: `Order #${order.orderNumber}`,
        text: `Check out my order on FashionKet: ${order.orderNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Order link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mmp-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
              <Package className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button 
              asChild 
              className="bg-mmp-primary hover:bg-mmp-primary2"
              size="lg"
            >
              <Link to="/orders">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
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
                <Link to="/orders">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Link>
              </Button>
              <h1 className="text-4xl font-bold text-white mb-2">
                Order Details
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-white/80">
                  #{order.orderNumber}
                </p>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <Badge className="bg-white text-mmp-primary text-lg px-4 py-2">
              {formatCurrency(order.totalAmount)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Order Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleCopyOrderNumber}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Order Number
                  </Button>
                  <Button variant="outline" onClick={handlePrintOrder}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>
                  <Button variant="outline" onClick={handleShareOrder}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Order
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                  {/* <Button variant="outline" asChild>
                    <Link to={`/orders/$slug/track`} params={{ slug: order._id}}>
                      <Truck className="mr-2 h-4 w-4" />
                      Track Order
                    </Link>
                  </Button> */}
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
                <CardDescription>
                  Track your order progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderTimeline order={order} />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.nameSnapshot}</h4>
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

            {/* Shipping & Billing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{order.shippingAddress.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{order.shippingAddress.phone}</span>
                    </div>
                    <div className="text-gray-600">
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p>{order.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
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
                        {order.paidAt ? 'Paid' : 'Pending'}
                      </div>
                      {order.paidAt && (
                        <div className="text-sm text-gray-600">
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
            </div>

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-mono">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span>{new Date(order.createdAt!).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  {order.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking</span>
                      <span className="font-mono">{order.trackingNumber}</span>
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
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-mmp-primary2">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.status === OrderStatus.PENDING_PAYMENT && (
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Complete Payment
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
                
                {['pending', 'processing'].includes(order.status) && (
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancel Order
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </CardContent>
            </Card>

            {/* Need Help? */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  We're here to assist you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat with Support
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Support
                  </Button>
                  <div className="text-sm text-gray-600 pt-3">
                    <p>Email: support@fashionket.com</p>
                    <p>Phone: 0700-FASHION</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Return Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Eligible for returns within 14 days</p>
                  <p>• Items must be in original condition</p>
                  <p>• Refunds processed in 5-7 business days</p>
                  <p>• Contact support for return authorization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}