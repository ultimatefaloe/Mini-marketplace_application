import React from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import type { IVariantOptions } from '@/types'

interface AddToCartButtonProps {
  product: {
    _id: string
    name: string
    price: number
    images: string[]
    stock?: number
  }
  quantity?: number
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variantOptions?: IVariantOptions
  className?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  showIcon?: boolean
  disabled?: boolean
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity,
  variantOptions,
  className,
  size = 'default',
  variant = 'default',
  showIcon = true,
  disabled = false,
  ...props
}) => {
  const { addToCart, getItemQuantity, isLoading } = useCart()
  const currentQuantity = getItemQuantity(product._id)
  const [isAdding, setIsAdding] = React.useState(false)

  const handleAddToCart = async () => {
    console.log("product added to cart: ", product)
    if (
      disabled ||
      isAdding ||
      (product.stock && currentQuantity >= product.stock)
    ) {
      return
    }

    setIsAdding(true)
    try {
      await addToCart(
        product._id,
        product.name,
        product.price,
        product.images[0],
        quantity ?? 1,
        variantOptions,
      )
    } finally {
      setIsAdding(false)
    }
  }

  const isOutOfStock = product.stock === 0
  const isMaxReached = product.stock  && currentQuantity >= product.stock 

  return (
    <Button
      onClick={handleAddToCart}
      disabled={
        disabled || isAdding || isOutOfStock || isMaxReached || isLoading
      }
      variant={variant}
      className={cn(
        'relative transition-all duration-200',
        variant === 'default' && 'bg-mmp-primary hover:bg-mmp-primary2',
        className,
      )}
      {...props}
    >
      {isAdding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : isOutOfStock ? (
        'Out of Stock'
      ) : isMaxReached ? (
        'Max Quantity'
      ) : (
        <>
          {showIcon && <ShoppingBag className="mr-2 h-4 w-4" />}
          Add to Cart
          {currentQuantity > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-1 text-xs">
              {currentQuantity}
            </span>
          )}
        </>
      )}
    </Button>
  )
}
