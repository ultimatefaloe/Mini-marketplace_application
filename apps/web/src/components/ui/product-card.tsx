import React, { useState } from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'
import type { IProductListItem } from '@/types'
import { Link } from '@tanstack/react-router'

// Simplified interface with only relevant data
interface ProductCardProps {
  product: IProductListItem
  className?: string
  onAddToCart?: (product: IProductListItem) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'featured'
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  size = 'md',
  variant = 'default',
  className,
}) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const finalPrice =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 10

  // Size configurations
  const sizeConfig = {
    sm: {
      imageHeight: 'h-32',
      contentPadding: 'p-3',
      nameLines: 1,
      showBrand: false,
      showSoldCount: false,
      quickActions: false,
    },
    md: {
      imageHeight: 'h-40',
      contentPadding: 'p-4',
      nameLines: 2,
      showBrand: true,
      showSoldCount: true,
      quickActions: true,
    },
    lg: {
      imageHeight: 'h-48',
      contentPadding: 'p-5',
      nameLines: 2,
      showBrand: true,
      showSoldCount: true,
      quickActions: true,
    },
  }

  const variantConfig = {
    default: {
      border: 'border-mmp-primary/10',
      hoverBorder: 'hover:border-mmp-secondary/40',
      shadow: 'hover:shadow-lg',
      rounded: 'rounded-xl',
    },
    compact: {
      border: 'border-transparent',
      hoverBorder: 'hover:border-mmp-secondary/20',
      shadow: 'hover:shadow-md',
      rounded: 'rounded-lg',
    },
    featured: {
      border: 'border-mmp-primary/20',
      hoverBorder: 'hover:border-mmp-accent/40',
      shadow: 'hover:shadow-xl hover:shadow-mmp-accent/10',
      rounded: 'rounded-2xl',
    },
  }

  const config = sizeConfig[size]
  const variantStyle = variantConfig[variant]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product)
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  // Determine product status
  const getProductStatus = () => {
    if (isOutOfStock)
      return { text: 'Out of Stock', className: 'bg-gray-100 text-gray-600' }
    if (isLowStock)
      return { text: 'Low Stock', className: 'bg-amber-100 text-amber-800' }
    if (product.soldCount > 100)
      return {
        text: 'Popular',
        className:
          'bg-gradient-to-r from-mmp-accent/20 to-mmp-secondary/20 text-mmp-accent',
      }
    return { text: 'In Stock', className: 'bg-emerald-100 text-emerald-800' }
  }

  const status = getProductStatus()

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-mmp-secondary focus-visible:ring-offset-2 rounded-xl"
    >
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-300 bg-white',
          variantStyle.border,
          variantStyle.hoverBorder,
          variantStyle.shadow,
          variantStyle.rounded,
          'hover:translate-y-[-2px]',
          className,
        )}
        aria-label={`View ${product.name} details`}
      >
        {/* Image Container */}
        <div
          className={cn(
            'relative overflow-hidden bg-gradient-to-br from-mmp-neutral/30 to-mmp-primary/5',
            config.imageHeight,
            variantStyle.rounded,
            'rounded-b-none',
          )}
        >
          {/* Discount Badge */}
          {product.discount > 0 && (
            <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-mmp-accent to-mmp-secondary text-white border-0 shadow-md">
              -{product.discount}%
            </Badge>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-mmp-primary2/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <div className="flex flex-col gap-2">
                {!isOutOfStock && (
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="bg-white text-mmp-primary2 hover:bg-mmp-neutral hover:text-mmp-primary2 shadow-md cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className={cn(
              'absolute top-3 right-3 z-10 w-8 h-8 rounded-full transition-all duration-200',
              isFavorite
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 shadow-sm',
            )}
            aria-label={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </Button>

          {/* Product Image */}
          <div
            className={cn(
              'w-full h-full transition-transform duration-500 group-hover:scale-[1.03]',
              !imageLoaded && 'animate-pulse bg-mmp-neutral/20',
            )}
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>

        {/* Product Info */}
        <CardContent className={cn(config.contentPadding, 'space-y-2')}>
          {/* Brand (if enabled) */}
          {config.showBrand && product.brand && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-mmp-accent uppercase tracking-wide truncate">
                {product.brand}
              </span>
              {product.soldCount > 50 && (
                <Badge
                  variant="outline"
                  className="border-mmp-secondary/30 text-mmp-secondary text-xs px-2 py-0 h-5"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Hot
                </Badge>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3
            className={cn(
              'font-medium text-mmp-primary2 transition-colors group-hover:text-mmp-accent',
              'truncate',
              config.nameLines === 2 && 'line-clamp-2 h-10',
              config.nameLines === 1 && 'line-clamp-1',
            )}
          >
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-mmp-primary2">
              {formatCurrency(finalPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-mmp-neutral/60 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
            {product.discount > 30 && (
              <Badge className="bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Great Deal
              </Badge>
            )}
          </div>

          {/* Stock & Status */}
          <div className="flex items-center justify-between pt-2 gap-2">
            <Badge
              variant="outline"
              className={cn('border-0 text-xs font-medium', status.className)}
            >
              {isOutOfStock ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {status.text}
                </span>
              ) : isLowStock ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {status.text} • {product.stock} left
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {status.text}
                </span>
              )}
            </Badge>

            {/* Sold Count (if enabled) */}
            {config.showSoldCount && product.soldCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i <= Math.min(5, Math.floor(product.soldCount / 20))
                          ? 'fill-orange-300 text-orange-300'
                          : 'fill-gray-200 text-orange-300',
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-mmp-neutral/60">
                  ({product.soldCount})
                </span>
              </div>
            )}
          </div>

          {/* Add to Cart Button (Mobile/Compact) */}
          {!config.quickActions && !isOutOfStock && (
            <Button
              onClick={handleAddToCart}
              className="w-full mt-3 bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90 text-white"
              size="sm"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// Helper component for displaying product cards in a grid
interface ProductGridProps {
  products: Array<ProductCardProps['product']>
  size?: ProductCardProps['size']
  variant?: ProductCardProps['variant']
  className?: string
  onAddToCart?: ProductCardProps['onAddToCart']
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  size = 'md',
  variant = 'default',
  className,
  onAddToCart,
}) => {
  const gridCols = {
    sm: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    md: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    lg: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4 md:gap-6', gridCols[size], className)}>
      {products.map((product) => (
        <ProductCard
          key={product._id.toString()}
          product={product}
          size={size}
          variant={variant}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
