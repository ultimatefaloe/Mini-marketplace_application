import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from './cart-item';
import { CartSummary } from './cart-summary';
import { useCart } from '@/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CartDrawerProps {
  trigger?: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  trigger,
  side = 'right',
}) => {
  const [open, setOpen] = React.useState(false);
  const { items, itemCount, isEmpty, clearCart, isLoading } = useCart();

  const handleCheckout = () => {
    setOpen(false);
    // Navigation will be handled by CartSummary
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mmp-primary text-xs font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side={side} className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Shopping Cart</SheetTitle>
            {!isEmpty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                disabled={isLoading}
                className="text-xs text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>
          <SheetDescription>
            {isEmpty
              ? 'Your cart is empty'
              : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                Your cart is empty
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add some items to get started
              </p>
              <Button
                className="mt-4"
                onClick={() => setOpen(false)}
                variant="outline"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  showImage={true}
                  showQuantityControls={true}
                  showRemoveButton={true}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Cart Summary - Fixed at bottom */}
        {!isEmpty && (
          <div className="border-t pt-4">
            <CartSummary
              showCheckoutButton={true}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};