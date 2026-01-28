import React from 'react'
import { Link } from '@tanstack/react-router'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'

interface CartIconProps {
  className?: string
  showCount?: boolean
}

export const CartIcon: React.FC<CartIconProps> = ({
  className,
  showCount = true,
}) => {
  const { itemCount, isLoading } = useCart()

  return (
    <Link
      to="/cart"
      className={cn(
        'relative inline-flex items-center justify-center hover:bg-mmp-primary/20 group',
        className,
      )}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <div className='p-1.5 rounded-lg bg-gradient-to-br from-mmp-primary/30 to-mmp-accent/20 group-hover:from-mmp-accent/30 group-hover:to-mmp-secondary/20 transition-all'>
        {!isLoading && <ShoppingBag className="h-4 w-4 text-white" />}

        {showCount && itemCount > 0 && !isLoading && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}

        {isLoading && showCount && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-mmp-neutral border-t-transparent" />
        )}
      </div>
    </Link>
  )
}
