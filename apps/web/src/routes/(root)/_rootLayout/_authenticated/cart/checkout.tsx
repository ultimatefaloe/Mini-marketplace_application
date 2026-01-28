import React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { useCreateOrder } from '@/api/order.query'
import {
  ArrowLeft,
  CreditCard,
  Shield,
  Truck,
  Package,
  CheckCircle,
  Loader2,
  MapPin,
  User,
  Phone,
  Mail,
  ShoppingCartIcon,
  ShoppingBag,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { PaymentModal } from '@/components/checkout/payment-modal'

// Shipping address schema
const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required').default('Nigeria'),
  postalCode: z.string().min(3, 'Postal code is required'),
  notes: z.string().optional(),
})

type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>

export const Route = createFileRoute(
  '/(root)/_rootLayout/_authenticated/cart/checkout',
)({
  component: CheckoutPage,
})

function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, itemCount, isEmpty } = useCart()
  const { mutateAsync: createOrder, isPending: isCreatingOrder } =
    useCreateOrder()

  const [showPaymentModal, setShowPaymentModal] = React.useState(false)
  const [paymentUrl, setPaymentUrl] = React.useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false)
  const [orderId, setOrderId] = React.useState<string | null>(null)

  const shippingFee = 1500
  const tax = subtotal * 0.075
  const total = subtotal + shippingFee + tax

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema as any),
    defaultValues: {
      country: 'Nigeria',
    },
    mode: 'onChange',
  })

  // Watch form values for real-time validation
  const formValues = watch()

  const handlePlaceOrder = async (data: ShippingAddressFormData) => {
    if (isEmpty) {
      toast.error('Your cart is empty')
      return
    }

    try {
      setIsProcessingPayment(true)

      // Create order payload
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          sku: `SKU-${item.productId}`,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || '',
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
        },
        notes: data.notes,
      }

      // Create order
      const orderResponse = await createOrder(orderPayload)
      const createdOrder = orderResponse

      // Store order ID for payment verification
      setOrderId(createdOrder._id)

      // Initialize payment with Paystack
      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: createdOrder._id,
          amount: Math.round(total * 100), // Convert to kobo
          email: data.email,
          callbackUrl: `${window.location.origin}/orders?payment_callback=true`,
        }),
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.error?.message || 'Payment initialization failed',
        )
      }

      // Store payment reference
      localStorage.setItem('payment_reference', paymentData.reference)
      localStorage.setItem('order_id', createdOrder._id)

      // Show payment modal with Paystack URL
      setPaymentUrl(paymentData.authorizationUrl)
      setShowPaymentModal(true)
    } catch (error: any) {
      console.error('Order creation failed:', error)
      toast.error('Failed to create order, please try again')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handlePaymentSuccess = () => {
    toast.success(
      'Payment Successful!, your order has been placed successfully.',
    )

    // Clear cart
    setTimeout(() => {
      navigate({ to: '/orders' })
    }, 2000)
  }

  const handlePaymentFailure = (errorMessage: string) => {
    toast.error('Payment Failed, please try again or contact support.')
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-mmp-primary/10 mb-6">
              <ShoppingCartIcon className="h-12 w-12 text-mmp-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Add items to your cart before proceeding to checkout.
            </p>
            <Button
              asChild
              className="bg-mmp-primary hover:bg-mmp-primary2"
              size="lg"
            >
              <Link to="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
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
                <Link to="/cart">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cart
                </Link>
              </Button>
              <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
              <p className="text-white/80">
                Complete your purchase in just a few steps
              </p>
            </div>
            <Badge className="bg-white text-mmp-primary text-lg px-4 py-2">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Shipping & Billing Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-mmp-primary/10">
                  <MapPin className="h-6 w-6 text-mmp-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Shipping Address
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enter your delivery details
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(handlePlaceOrder)}
                className="space-y-6"
              >
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          id="fullName"
                          className="pl-10"
                          placeholder="John Doe"
                          {...register('fullName')}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-sm text-red-500">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          placeholder="john@example.com"
                          {...register('email')}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-10"
                        placeholder="+234 800 123 4567"
                        {...register('phone')}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Shipping Address
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        placeholder="Street address, P.O. Box, company name"
                        {...register('addressLine1')}
                      />
                      {errors.addressLine1 && (
                        <p className="text-sm text-red-500">
                          {errors.addressLine1.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">
                        Address Line 2 (Optional)
                      </Label>
                      <Input
                        id="addressLine2"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        {...register('addressLine2')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Lagos"
                          {...register('city')}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-500">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="Lagos State"
                          {...register('state')}
                        />
                        {errors.state && (
                          <p className="text-sm text-red-500">
                            {errors.state.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          placeholder="100001"
                          {...register('postalCode')}
                        />
                        {errors.postalCode && (
                          <p className="text-sm text-red-500">
                            {errors.postalCode.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input id="country" {...register('country')} disabled />
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Notes (Optional)
                  </h3>
                  <Textarea
                    placeholder="Any special instructions for delivery..."
                    className="min-h-[100px]"
                    {...register('notes')}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-mmp-primary hover:bg-mmp-primary2"
                  size="lg"
                  disabled={isProcessingPayment || !isValid || isCreatingOrder}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : isCreatingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Security Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-semibold">Secure Payment</div>
                  <div className="text-sm text-gray-600">SSL Encrypted</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold">Fast Delivery</div>
                  <div className="text-sm text-gray-600">2-5 Business Days</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
                <Package className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="font-semibold">Easy Returns</div>
                  <div className="text-sm text-gray-600">14-Day Policy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h3>

                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.nameSnapshot}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 truncate">
                          {item.nameSnapshot}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(item.priceSnapshot * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-center text-gray-600">
                      + {items.length - 3} more items
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingFee > 0 ? formatCurrency(shippingFee) : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (7.5%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-mmp-primary2">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Accepted Payment Methods
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Credit & Debit Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Bank Transfer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">USSD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Mobile Money</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentUrl={paymentUrl}
        orderId={orderId}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  )
}
