import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks';
import { useNavigate } from 'react-router-dom';

interface CartBadgeProps {
  showCount?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'ghost' | 'default' | 'outline';
}

export const CartBadge: React.FC<CartBadgeProps> = ({
  showCount = true,
  onClick,
  className,
  variant = 'ghost',
}) => {
  const navigate = useNavigate();
  const { itemCount, isLoading } = useCart();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/cart');
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn('relative', className)}
      onClick={handleClick}
      disabled={isLoading}
    >
      <ShoppingCart className="h-5 w-5" />
      {showCount && itemCount > 0 && (
        <span
          className={cn(
            'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
            'bg-mmp-primary text-white',
            'transition-all duration-200',
            isLoading && 'animate-pulse',
          )}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      <span className="sr-only">Shopping cart with {itemCount} items</span>
    </Button>
  );
};