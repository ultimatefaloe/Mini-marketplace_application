import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks';
import { useNavigate } from 'react-router-dom';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  className?: string;
  onCheckout?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  showCheckoutButton = true,
  className,
  onCheckout,
}) => {
  const navigate = useNavigate();
  const { subtotal, itemCount, isEmpty, isLoading } = useCart();

  // Tax and shipping calculations (you can customize these)
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout');
    }
  };

  if (isEmpty && !isLoading) {
    return (
      <div className={cn('rounded-lg border bg-card p-6', className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">
            Your cart is empty
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add some items to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <div className="mt-4 space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `$${subtotal.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Tax ({(taxRate * 100).toFixed(0)}%)
          </span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Total</span>
          <span className="text-xl font-bold text-mmp-primary">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping Notice */}
      {subtotal > 0 && subtotal < 50 && (
        <div className="mt-4 rounded-md bg-blue-50 p-3 text-xs text-blue-700">
          Add <span className="font-semibold">${(50 - subtotal).toFixed(2)}</span> more
          to get free shipping!
        </div>
      )}

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Button
          className="mt-6 w-full bg-mmp-primary hover:bg-mmp-primary2"
          size="lg"
          onClick={handleCheckout}
          disabled={isEmpty || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Proceed to Checkout'
          )}
        </Button>
      )}

      {/* Continue Shopping Link */}
      <button
        className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => navigate('/products')}
      >
        Continue Shopping
      </button>
    </div>
  );
};