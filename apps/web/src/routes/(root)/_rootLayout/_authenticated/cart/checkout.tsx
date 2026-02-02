import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { useAuth, useCart } from '@/hooks'
import {
  useAddAddress,
  useCreateOrder,
  useDeleteAddress,
  useInitPayment,
} from '@/api/mutations'
import { addressesQuery } from '@/api/queries'
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Loader2,
  MapPin,
  User,
  Phone,
  Mail,
  ShoppingCartIcon,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Truck,
  Store,
  Shield,
  Lock,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { FcAddressBook } from 'react-icons/fc'
import { DeliveryMethod } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { useShippingFeeQuery } from '@/api/hooks/address.hook'

// Shipping address schema for new addresses
const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required').default('Nigeria'),
  postalCode: z.string().min(3, 'Postal code is required'),
  label: z.string().optional(),
  isDefault: z.boolean().default(false),
})

type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>

export const Route = createFileRoute(
  '/(root)/_rootLayout/_authenticated/cart/checkout',
)({
  component: CheckoutPage,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(addressesQuery())
  },
})

function CheckoutPage() {
  const addresses = Route.useLoaderData()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { items, subtotal, itemCount, isEmpty } = useCart()
  const { mutateAsync: createOrder, isPending: isCreatingOrder } =
    useCreateOrder()
  const { mutateAsync: initPayment, isPending: isInitializingPayment } =
    useInitPayment()
  const { mutateAsync: addAddress } = useAddAddress()
  const { mutateAsync: deleteAddress } = useDeleteAddress()

  const [deliveryMethod, setDeliveryMethod] = React.useState<DeliveryMethod>(
    DeliveryMethod.DELIVERY,
  )
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>('')
  const [showAddAddressDialog, setShowAddAddressDialog] = React.useState(false)
  const [isSubmittingAddress, setIsSubmittingAddress] = React.useState(false)
  const [shippingFee, setShippingFee] = React.useState<number>(0)

  // Dynamic shipping fee based on delivery method
  const tax = subtotal * 0.025
  const total = subtotal + tax + (shippingFee ?? 0)

  React.useEffect(() => {
    const csf = () => {
      const result = useShippingFeeQuery(selectedAddressId)
      setShippingFee(result.data?.totalDeliveryFee)
    }
    csf()
  }, [selectedAddressId])

  // Form for new addresses
  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    formState: { errors: addressErrors, isValid: isAddressValid },
    reset: resetAddressForm,
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema as any),
    defaultValues: {
      country: 'Nigeria',
      isDefault: false,
    },
    mode: 'onChange',
  })

  // const selectedAddress = addresses.find(
  //   (addr) => addr._id === selectedAddressId,
  // )

  // Auto-select first address if none selected
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0]._id)
    }
  }, [addresses, selectedAddressId])

  const handleAddNewAddress = async (data: ShippingAddressFormData) => {
    try {
      setIsSubmittingAddress(true)
      const newAddress = await addAddress(data)
      toast.success('Address added successfully')

      // Select the newly added address
      setSelectedAddressId(newAddress._id)
      setShowAddAddressDialog(false)
      resetAddressForm()

      // Refresh addresses list
      await queryClient.invalidateQueries({ queryKey: ['addresses'] })
    } catch (error: any) {
      toast.error(error.message || 'Failed to add address, please try again')
    } finally {
      setIsSubmittingAddress(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (addresses.length <= 1) {
      toast.error('Cannot delete the last address')
      return
    }

    try {
      await deleteAddress(addressId)
      toast.success('Address deleted successfully')

      // If deleted address was selected, select another one
      if (selectedAddressId === addressId) {
        const remainingAddress = addresses.find(
          (addr) => addr._id !== addressId,
        )
        if (remainingAddress) {
          setSelectedAddressId(remainingAddress._id)
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['addresses'] })
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address, please try again')
    }
  }

  const handlePlaceOrder = async () => {
    if (isEmpty) {
      toast.error('Your cart is empty')
      return
    }

    // Validate delivery method requirements
    if (deliveryMethod === DeliveryMethod.DELIVERY && !selectedAddressId) {
      toast.error('Please select a shipping address')
      return
    }

    try {
      setIsProcessing(true)

      // Create order payload
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        addressId:
          deliveryMethod === DeliveryMethod.DELIVERY
            ? selectedAddressId
            : undefined,
        deliveryMethod: deliveryMethod,
        notes:
          deliveryMethod === DeliveryMethod.PICK_UP
            ? 'Customer will pickup at store'
            : '',
      }

      console.log('🛒 Creating order with payload:', orderPayload)

      // Step 1: Create order
      const createdOrder = await createOrder(orderPayload)
      console.log('✅ Order created:', createdOrder)

      // Step 2: Initialize payment
      const paymentData = await initPayment({
        orderId: createdOrder._id,
        callbackUrl: `${window.location.origin}/cart/payment-status`,
      })

      console.log('💰 Payment initialized:', paymentData)

      // Store order info for payment status page
      localStorage.setItem('last_order_id', createdOrder._id)
      localStorage.setItem('last_order_number', createdOrder.orderNumber)

      // Step 3: Redirect to payment gateway
      console.log('🌐 Redirecting to payment gateway...')
      window.location.href = paymentData.authorization_url
    } catch (error: any) {
      console.error('❌ Order creation failed:', error)
      toast.error(error.message || 'Failed to process order, please try again')
      setIsProcessing(false)
    }
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
          {/* Left Column - Shipping & Billing */}
          <div className="lg:col-span-8">
            {/* Delivery Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-mmp-primary/10">
                  <Truck className="h-6 w-6 text-mmp-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Method
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Choose how you'd like to receive your order
                  </p>
                </div>
              </div>

              <Tabs
                value={deliveryMethod}
                onValueChange={(value) =>
                  setDeliveryMethod(value as DeliveryMethod)
                }
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="delivery" className="gap-2">
                    <Truck className="h-4 w-4" />
                    Home Delivery
                  </TabsTrigger>
                  <TabsTrigger value="pickup" className="gap-2">
                    <Store className="h-4 w-4" />
                    Store Pickup
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="delivery" className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                          Home Delivery
                        </h4>
                        <p className="text-sm text-blue-700">
                          Your order will be delivered to your selected address
                          within 2-5 business days.
                        </p>
                        <p className="text-sm text-blue-700 mt-2">
                          Delivery fee: {formatCurrency(shippingFee)}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pickup" className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Store className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">
                          Store Pickup
                        </h4>
                        <p className="text-sm text-green-700">
                          Pick up your order at our store location. We'll notify
                          you when it's ready.
                        </p>
                        <p className="text-sm text-green-700 mt-2">
                          Pickup fee:{' '}
                          <span className="font-semibold">Free</span>
                        </p>
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-sm font-semibold text-green-900 mb-1">
                            Store Location:
                          </p>
                          <p className="text-sm text-green-700">
                            123 Main Street, Lagos, Nigeria
                          </p>
                          <p className="text-sm text-green-700">
                            Mon-Sat: 9:00 AM - 6:00 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Shipping Address (Only for delivery) */}
            {deliveryMethod === DeliveryMethod.DELIVERY && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-mmp-primary/10">
                      <MapPin className="h-6 w-6 text-mmp-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Shipping Address
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Select or add a delivery address
                      </p>
                    </div>
                  </div>
                  <Dialog
                    open={showAddAddressDialog}
                    onOpenChange={setShowAddAddressDialog}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleSubmitAddress(handleAddNewAddress)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              placeholder="John Doe"
                              {...registerAddress('fullName')}
                            />
                            {addressErrors.fullName?.message && (
                              <span className="text-red-600 border border-red-600 bg-red-500/30 rounded-xl px-3 py-1.5 mb-2">
                                {addressErrors.fullName?.message}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              placeholder="08012345678"
                              {...registerAddress('phone')}
                            />
                            {addressErrors.phone?.message && (
                              <span className="text-red-600 border border-red-600 bg-red-500/30 rounded-xl px-3 py-1.5 mb-2">
                                {addressErrors.phone?.message}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addressLine1">Address Line 1 *</Label>
                          <Input
                            id="addressLine1"
                            placeholder="Street address, P.O. Box, company name"
                            {...registerAddress('addressLine1')}
                          />
                          {addressErrors.addressLine1?.message && (
                            <span className="text-red-600 border border-red-600 bg-red-500/30 rounded-xl px-3 py-1.5 mb-2">
                              {addressErrors.addressLine1?.message}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addressLine2">
                            Address Line 2 (Optional)
                          </Label>
                          <Input
                            id="addressLine2"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                            {...registerAddress('addressLine2')}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input id="city" {...registerAddress('city')} />
                            {addressErrors.city?.message && (
                              <span className="text-red-600 border border-red-600 bg-red-500/30 rounded-xl px-3 py-1.5 mb-2">
                                {addressErrors.city?.message}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input id="state" {...registerAddress('state')} />
                            {addressErrors.state?.message && (
                              <span className="text-red-600 border border-red-600 bg-red-500/30 rounded-xl px-3 py-1.5 mb-2">
                                {addressErrors.state?.message}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code *</Label>
                            <Input
                              id="postalCode"
                              {...registerAddress('postalCode')}
                            />
                            {addressErrors.postalCode?.message && (
                              <span className="text-red-600 border border-red-600 bg-red-500/30 rounded-xl px-3 py-1.5 mb-2">
                                {addressErrors.postalCode?.message}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            {...registerAddress('country')}
                            disabled
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            {...registerAddress('isDefault')}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="isDefault" className="text-sm">
                            Set as default address
                          </Label>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowAddAddressDialog(false)}
                            disabled={isSubmittingAddress}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-mmp-primary hover:bg-mmp-primary2"
                            disabled={!isAddressValid || isSubmittingAddress}
                          >
                            {isSubmittingAddress ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              'Add Address'
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Address Selection */}
                {addresses.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No addresses saved
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Add a shipping address to continue with checkout
                    </p>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    className="space-y-3"
                  >
                    {addresses.map((address) => (
                      <div key={address._id} className="relative">
                        <RadioGroupItem
                          value={address._id}
                          id={`address-${address._id}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`address-${address._id}`}
                          className="flex flex-col p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-mmp-primary peer-data-[state=checked]:border-mmp-primary peer-data-[state=checked]:bg-mmp-primary/5 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-gray-100">
                                <FcAddressBook className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-gray-900">
                                    {address.fullName}
                                  </span>
                                  {address.isDefault && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p>{address.addressLine1}</p>
                                  {address.addressLine2 && (
                                    <p>{address.addressLine2}</p>
                                  )}
                                  <p>
                                    {address.city}, {address.state}{' '}
                                    {address.postalCode}
                                  </p>
                                  <p>{address.country}</p>
                                  <p className="mt-2">📞 {address.phone}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                asChild
                              >
                                <Link to={`/account`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              {!address.isDefault && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() =>
                                    handleDeleteAddress(address._id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-mmp-primary/10">
                  <User className="h-6 w-6 text-mmp-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Contact Information
                  </h2>
                  <p className="text-gray-600 text-sm">
                    We'll use this to contact you about your order
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{user?.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>{user?.email}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <Link to="/account">
                      <Edit className="mr-2 h-3 w-3" />
                      Update
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Notes (Optional)
              </h3>
              <Textarea
                placeholder="Any special instructions for delivery, packaging preferences, or delivery timing..."
                className="min-h-[100px] resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                We'll do our best to accommodate your requests
              </p>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Order Summary Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
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
                      <div className="flex-1 min-w-0">
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
                    <div className="text-center text-gray-600 text-sm py-2">
                      + {items.length - 3} more item
                      {items.length - 3 !== 1 ? 's' : ''}
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
                    <span className="text-gray-600">
                      {deliveryMethod === DeliveryMethod.DELIVERY
                        ? 'Shipping'
                        : 'Pickup'}
                    </span>
                    <span className="font-medium">
                      {shippingFee > 0 ? formatCurrency(shippingFee) : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (2.5%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-mmp-primary2">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  className="w-full bg-mmp-primary hover:bg-mmp-primary2 mt-6"
                  size="lg"
                  disabled={
                    isProcessing ||
                    isCreatingOrder ||
                    isInitializingPayment ||
                    (deliveryMethod === DeliveryMethod.DELIVERY &&
                      !selectedAddressId)
                  }
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Place Order Securely
                    </>
                  )}
                </Button>

                {deliveryMethod === DeliveryMethod.DELIVERY &&
                  !selectedAddressId && (
                    <p className="mt-3 text-sm text-red-600 text-center">
                      Please select a shipping address
                    </p>
                  )}

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our{' '}
                  <Link
                    to="/terms"
                    className="text-mmp-primary hover:underline"
                  >
                    Terms of Service
                  </Link>
                </p>
              </div>

              {/* Security & Trust */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Secure & Trusted Checkout
                </h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Money-Back Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Need Help?</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Our customer support team is here to assist you.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-800">
                    📞 <strong>Call:</strong> +234 800 123 4567
                  </p>
                  <p className="text-blue-800">
                    ✉️ <strong>Email:</strong> support@example.com
                  </p>
                  <p className="text-blue-800">
                    🕒 <strong>Hours:</strong> Mon-Sun, 8AM-8PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
