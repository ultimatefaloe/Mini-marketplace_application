import React from 'react';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks';

interface CartItemProps {
  item: {
    _id?: string
    productId: string;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    productImage?: string;
    variantOptions?: {
      size?: string;
      color?: string;
      [key: string]: any;
    };
  };
  showImage?: boolean;
  showQuantityControls?: boolean;
  showRemoveButton?: boolean;
  className?: string;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemove?: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  showImage = true,
  showQuantityControls = true,
  showRemoveButton = true,
  className,
  onQuantityChange,
  onRemove,
}) => {
  const { updateCartItem, removeFromCart, isLoading } = useCart();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateCartItem(item.productId, newQuantity, item?._id!);
      onQuantityChange?.(item.productId, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeFromCart(item?._id!, item.productId, item.nameSnapshot);
      onRemove?.(item.productId);
    } finally {
      setIsUpdating(false);
    }
  };

  const subtotal = item.priceSnapshot * item.quantity;

  return (
    <div
      className={cn(
        'flex gap-4 rounded-lg border bg-card p-4 transition-opacity',
        isUpdating && 'opacity-50',
        className,
      )}
    >
      {/* Product Image */}
      {showImage && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
          {item.productImage ? (
            <img
              src={item.productImage}
              alt={item.nameSnapshot}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>
      )}

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-medium text-foreground">{item.nameSnapshot}</h3>

          {/* Variant Options */}
          {item.variantOptions && (
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {item.variantOptions.size && (
                <span>Size: {item.variantOptions.size}</span>
              )}
              {item.variantOptions.color && (
                <span>Color: {item.variantOptions.color}</span>
              )}
            </div>
          )}

          {/* Price */}
          <p className="mt-1 text-sm font-semibold text-foreground">
            ${item.priceSnapshot.toFixed(2)}
            {item.quantity > 1 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                × {item.quantity} = ${subtotal.toFixed(2)}
              </span>
            )}
          </p>
        </div>

        {/* Quantity Controls */}
        {showQuantityControls && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || isLoading || item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>

              <span className="flex h-8 min-w-[40px] items-center justify-center border-x px-2 text-sm font-medium">
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  item.quantity
                )}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating || isLoading}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Remove Button */}
            {showRemoveButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleRemove}
                disabled={isUpdating || isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};