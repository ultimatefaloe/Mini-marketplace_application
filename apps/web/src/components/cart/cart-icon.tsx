import React from 'react'
import { Link } from '@tanstack/react-router'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface CartIconProps {
  showCount?: boolean
}

export const CartIcon: React.FC<CartIconProps> = ({
  showCount = true,
}) => {
  const { itemCount, isLoading } = useCart()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-mmp-primary/20 relative group"
      aria-label="Notifications"
      asChild
    >
      <Link
        to="/cart"
      >
        <div>
          {!isLoading && (
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-mmp-primary/30 to-mmp-accent/20 group-hover:from-mmp-accent/30 group-hover:to-mmp-secondary/20 transition-all">
              <ShoppingBag className="h-5 w-5 text-mmp-neutral" />
            </div>
          )}

          {showCount && itemCount > 0 && !isLoading && (
            <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center border-2 border-mmp-primary2">
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}

          {isLoading && showCount && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-mmp-neutral border-t-transparent" />
          )}
        </div>
      </Link>
    </Button>
  )
}
