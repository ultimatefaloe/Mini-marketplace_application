import React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingCart,
  Package,
  Shield,
  Truck,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks';
import { useCart } from '@/hooks/use-cart';

export const Route = createFileRoute('/(root)/_rootLayout/_authenticated/cart/')({
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    items, 
    subtotal, 
    itemCount, 
    isLoading, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    isEmpty 
  } = useCart();

  const [couponCode, setCouponCode] = React.useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);
  const shippingFee = itemCount > 0 ? 1500 : 0; // Fixed shipping fee
  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + shippingFee + tax;

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(productId, 'Item');
    } else {
      await updateCartItem(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    await removeFromCart(productId, productName);
  };

  const handleClearCart = async () => {
    const confirmed = window.confirm('Are you sure you want to clear your cart?');
    if (confirmed) {
      await clearCart();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      // TODO: Implement coupon validation API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Coupon applied successfully!');
      setCouponCode('');
    } catch (error) {
      toast.error('Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (isEmpty) {
      toast.error('Your cart is empty');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to proceed to checkout');
      navigate({ to: '/login', search: { redirect: '/cart/checkout' } });
      return;
    }

    navigate({ to: '/cart/checkout' });
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

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-mmp-primary/10 mb-6">
              <ShoppingCart className="h-12 w-12 text-mmp-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to add products.
            </p>
            <Button 
              asChild 
              className="bg-mmp-primary hover:bg-mmp-primary2"
              size="lg"
            >
              <Link to="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Shopping
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
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              <h1 className="text-4xl font-bold text-white mb-2">
                Shopping Cart
              </h1>
              <p className="text-white/80">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Badge className="bg-white text-mmp-primary text-lg px-4 py-2">
              {formatCurrency(subtotal)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            {/* Cart Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Cart Items ({itemCount})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${JSON.stringify(item.variantOptions)}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="sm:w-24 sm:h-24 w-full h-48">
                      <Link
                        to="/products/$slug"
                        params={{ slug: 'product-slug' }} // You'll need to map productId to slug
                        className="block h-full"
                      >
                        <div className="w-full h-full rounded-lg bg-gray-100 overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.nameSnapshot}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                        <div className="flex-1">
                          <Link
                            to="/products/$slug"
                            params={{ slug: 'product-slug' }}
                            className="block"
                          >
                            <h3 className="font-semibold text-gray-900 hover:text-mmp-primary">
                              {item.nameSnapshot}
                            </h3>
                          </Link>
                          {item.variantOptions && (
                            <div className="mt-2 space-y-1">
                              {item.variantOptions.sizes && (
                                <div className="text-sm text-gray-600">
                                  Size: <span className="font-medium">{item.variantOptions.sizes}</span>
                                </div>
                              )}
                              {item.variantOptions.colors && (
                                <div className="text-sm text-gray-600">
                                  Color: <span className="font-medium">{item.variantOptions.colors}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-2">
                            <span className="text-lg font-bold text-mmp-primary2">
                              {formatCurrency(item.priceSnapshot)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-4 sm:mt-0">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveItem(item.productId, item.nameSnapshot)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-2 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(item.priceSnapshot * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-semibold">Secure Payment</div>
                <div className="text-xs text-gray-600">SSL Encryption</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold">Free Shipping</div>
                <div className="text-xs text-gray-600">Over ₦50,000</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-semibold">Easy Returns</div>
                <div className="text-xs text-gray-600">14-Day Policy</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-semibold">Multiple Payment</div>
                <div className="text-xs text-gray-600">Options Available</div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h3>

                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingFee > 0 ? formatCurrency(shippingFee) : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (VAT 7.5%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-mmp-primary2">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full bg-mmp-primary hover:bg-mmp-primary2 mb-4"
                  size="lg"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Secure Payment Info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure payment processed by Paystack</span>
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link to="/products">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Order Notes */}
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Need Help?
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Free shipping on orders over ₦50,000</li>
                  <li>• 14-day return policy</li>
                  <li>• 24/7 customer support</li>
                  <li>• Secure payment processing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}