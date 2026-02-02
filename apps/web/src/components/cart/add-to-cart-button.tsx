import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks';
import type { IVariantOptions } from '@/types';

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock?: number;
  };
  quantity?: number;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variantOptions?: IVariantOptions;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  showIcon?: boolean;
  disabled?: boolean;
  onAddSuccess?: () => void;
  onAddError?: (error: string) => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity = 1,
  variantOptions,
  className,
  size = 'default',
  variant = 'default',
  showIcon = true,
  disabled = false,
  onAddSuccess,
  onAddError,
}) => {
  const { addToCart, getItemQuantity, isLoading: cartLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentQuantity = getItemQuantity(product._id);

  const handleAddToCart = async () => {
    if (isAdding || disabled) {
      return;
    }

    // Validate stock before adding
    if (product.stock !== undefined) {
      const newTotal = currentQuantity + quantity;
      if (newTotal > product.stock) {
        onAddError?.(
          `Cannot add ${quantity} more. Only ${product.stock - currentQuantity} left in stock.`,
        );
        return;
      }
    }

    setIsAdding(true);
    try {
      const result = await addToCart(
        product._id,
        product.name,
        product.price,
        product.images[0],
        quantity,
        variantOptions,
      );

      if (result.success) {
        setShowSuccess(true);
        onAddSuccess?.();

        // Reset success indicator after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        onAddError?.(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add to cart';
      onAddError?.(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.stock === 0;
  const isMaxReached =
    product.stock !== undefined && currentQuantity >= product.stock;
  const isDisabled =
    disabled || isAdding || isOutOfStock || isMaxReached || cartLoading;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      size={size}
      variant={variant}
      className={cn(
        'relative transition-all duration-200',
        variant === 'default' && 'bg-mmp-primary hover:bg-mmp-primary2',
        showSuccess && 'bg-green-600 hover:bg-green-700',
        className,
      )}
    >
      {showSuccess ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added!
        </>
      ) : isAdding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : isOutOfStock ? (
        'Out of Stock'
      ) : isMaxReached ? (
        'Max Quantity Reached'
      ) : (
        <>
          {showIcon && <ShoppingBag className="mr-2 h-4 w-4" />}
          Add to Cart
        </>
      )}
    </Button>
  );
};