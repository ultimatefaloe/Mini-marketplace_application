import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ui/product-card'
import {
  getProductBySlug,
  getRelatedProducts,
  getCategoryById,
} from '@/data/product'
import {
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  ArrowLeft,
  Minus,
  Plus,
  Check,
  Eye,
} from 'lucide-react'
import { AddToCartButton } from '@/components/ui/add-to-cart-button'

export const Route = createFileRoute('/(root)/_rootLayout/products/$slug')({
  component: ProductDetailPage,
  validateSearch: z.object({}),
  params: {
    parse: (params) =>
      z
        .object({
          slug: z.string().min(1),
        })
        .parse(params),
  },
  loader: async ({ params }) => {
    const product = getProductBySlug(params.slug)
    if (!product) {
      throw new Error('Product not found')
    }

    const relatedProducts = getRelatedProducts(product._id, 4)
    const category = getCategoryById(product.categoryId)

    return { product, relatedProducts, category }
  },
})

function ProductDetailPage() {
  const { product, relatedProducts, category } = Route.useLoaderData()

  const [selectedImage, setSelectedImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null)

  const discountedPrice = product.price * (1 - product.discount / 100)
  const savings = product.price - discountedPrice
  const isOutOfStock = product.stock === 0

  // Mock variant options based on product tags
  const sizes = ['XS', 'S', 'M', 'L', 'XL']
  const colors = ['Black', 'White', 'Navy', 'Gray', 'Beige']

  const handleBuyNow = () => {
    if (isOutOfStock) return

    // TODO: Implement buy now logic
    console.log('Buy now:', {
      product: product.name,
      quantity,
      size: selectedSize,
      color: selectedColor,
      price: discountedPrice,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to="/"
              params={{}}
              className="text-gray-500 hover:text-mmp-primary"
            >
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link to="/products">Products</Link>

            {category && (
              <>
                <span className="text-gray-300">/</span>
                <Link
                  to={`/categories/$slug`}
                  params={{ slug: category?.slug }}
                  className="text-gray-500 hover:text-mmp-primary"
                >
                  {category.name}
                </Link>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-1/2">
            <div className="sticky top-8">
              {/* Back Button - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 lg:hidden"
                asChild
              >
                <Link
                  to={category ? `/categories/$slug` : '/products'}
                  params={{ slug: category?.slug }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to {category?.name || 'Products'}
                </Link>
              </Button>

              {/* Main Image */}
              <div className="mb-4 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-auto w-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                      selectedImage === index
                        ? 'border-mmp-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - view ${index + 1}`}
                      className="h-20 w-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            {/* Back Button - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 hidden lg:inline-flex"
              asChild
            >
              <Link
                to={category ? '/categories/$slug' : '/products'}
                params={{ slug: category?.slug }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {category?.name || 'Products'}
              </Link>
            </Button>

            {/* Product Header */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full p-2 hover:bg-gray-100"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-2 hover:bg-gray-100"
                    aria-label="Share"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Brand & Rating */}
              <div className="mb-4 flex items-center gap-4">
                <span className="font-medium text-gray-700">
                  {product.brand}
                </span>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-current text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.viewCount / 100} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(discountedPrice)}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                        Save {product.discount}%
                      </span>
                    </>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    You save {formatCurrency(savings)}
                  </p>
                )}
              </div>
            </div>

            {/* Variant Selection */}
            <div className="mb-8 space-y-6">
              {/* Size Selection */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="font-medium text-gray-900">Size</label>
                  <button
                    type="button"
                    className="text-sm text-mmp-primary hover:text-mmp-primary2"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border px-4 py-3 font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-mmp-primary bg-mmp-primary text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="mb-3 block font-medium text-gray-900">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                        selectedColor === color
                          ? 'border-mmp-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{
                          backgroundColor: color.toLowerCase(),
                        }}
                      />
                      <span>{color}</span>
                      {selectedColor === color && (
                        <Check className="h-4 w-4 text-mmp-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <label className="mb-3 block font-medium text-gray-900">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-100 disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 hover:bg-gray-100 disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.stock} items available
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-8 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <AddToCartButton
                  className="flex-1 bg-mmp-primary2 hover:bg-mmp-primary2"
                  product={product}
                  size="lg"
                  aria-label={'Add to cart'}
                />

                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
              <p className="text-center text-sm text-gray-600">
                Free shipping on orders over ₦50,000
              </p>
            </div>

            {/* Product Details */}
            <div className="mb-8 space-y-6">
              {/* Description */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Premium quality materials
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Handcrafted with attention to detail
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Ethically sourced materials
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    1-year warranty included
                  </li>
                </ul>
              </div>

              {/* Tags */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <Truck className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                  <div className="text-sm font-medium">Free Shipping</div>
                  <div className="text-xs text-gray-500">Over ₦50,000</div>
                </div>
                <div className="text-center">
                  <Shield className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                  <div className="text-sm font-medium">2-Year Warranty</div>
                  <div className="text-xs text-gray-500">
                    Quality Guaranteed
                  </div>
                </div>
                <div className="text-center sm:col-span-1">
                  <Check className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                  <div className="text-sm font-medium">Secure Payment</div>
                  <div className="text-xs text-gray-500">100% Secure</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Related Products
              </h2>
              <Link
                to="/categories/$slug"
                params={{ slug: category ? category.slug : '' }}
                className="text-mmp-primary hover:text-mmp-primary2 hover:underline"
              >
                View All in {category?.name}
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
