import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { ProductGrid } from '@/components/ui/product-card'
import { ProductFilters } from '@/components/ui/product-filters'
import { Pagination, CompactPagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import {
  sampleProducts,
  getAllBrands,
  getAllTags,
  getMaxPrice,
  filterProductsWithPagination,
} from '@/data/product'
import { formatCurrency } from '@/lib/utils'
import type { IProductQueryFilters } from '@/types'
import { Filter, Grid3x3, List, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/(root)/_rootLayout/products/')({
  component: ProductsPage,
  validateSearch: z
    .object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      categoryId: z.string().optional(),
      brand: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      tags: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    })
    .transform((s) => ({
      page: s.page ?? 1,
      limit: s.limit ?? 12,
      search: s.search ?? '',
      categoryId: s.categoryId,
      brand: s.brand,
      minPrice: s.minPrice,
      maxPrice: s.maxPrice,
      tags: s.tags,
      sortBy: s.sortBy ?? 'createdAt',
      sortOrder: s.sortOrder ?? 'desc',
    })),
  loaderDeps: ({ search }) => ({
    page: search.page,
    limit: search.limit,
    search: search.search,
    categoryId: search.categoryId,
    brand: search.brand,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    tags: search.tags,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
  }),
  loader: ({ deps }) => {
    const { products, meta } = filterProductsWithPagination(deps)
    const brands = getAllBrands()
    const tags = getAllTags()
    const maxPrice = getMaxPrice()

    return { products, meta, brands, tags, maxPrice }
  },
})

function ProductsPage() {
  const { products, meta, brands, tags, maxPrice } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const hasActiveFilters = React.useMemo(() => {
    return Boolean(
      search.search ||
      search.categoryId ||
      search.brand ||
      search.minPrice !== undefined ||
      search.maxPrice !== undefined ||
      search.tags ||
      search.sortBy !== 'createdAt' ||
      search.sortOrder !== 'desc',
    )
  }, [search])

  const handleFilterChange = (newFilters: Partial<IProductQueryFilters>) => {
    // Reset to page 1 when filters change
    const updatedFilters = { ...newFilters, page: 1 }
    navigate({
      search: (prev) => ({ ...prev, ...updatedFilters }),
      replace: true,
    })
  }

  const handlePageChange = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
      replace: true,
    })
  }

  const handleClearFilters = () => {
    navigate({
      search: {
        search: '',
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      replace: true,
    })
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-mmp-primary2 to-mmp-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl font-bold">Our Collection</h1>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Discover premium fashion items from top brands. Filter by
              category, price, brand, and more to find exactly what you're
              looking for.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {sampleProducts.length}+
                </div>
                <div className="text-sm text-white/80">Total Products</div>
              </div>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">{brands.length}</div>
                <div className="text-sm text-white/80">Brands</div>
              </div>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">{tags.length}</div>
                <div className="text-sm text-white/80">Tags</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64">
            <ProductFilters
              filters={search}
              onFilterChange={handleFilterChange}
              brands={brands}
              tags={tags}
              maxPrice={maxPrice}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    All Products
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <p className="text-gray-600">
                      Showing{' '}
                      {Math.min((meta.page - 1) * meta.limit + 1, meta.total)}{' '}
                      to {Math.min(meta.page * meta.limit, meta.total)} of{' '}
                      {meta.total} products
                      {search.search && ` for "${search.search}"`}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-mmp-primary hover:text-mmp-primary2 hover:underline"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-300 p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      className={viewMode === 'grid' ? 'bg-mmp-primary' : ''}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      className={viewMode === 'list' ? 'bg-mmp-primary' : ''}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-mmp-primary focus:outline-none focus:ring-1 focus:ring-mmp-primary"
                      value={search.sortBy || 'createdAt'}
                      onChange={(e) =>
                        handleFilterChange({ sortBy: e.target.value })
                      }
                    >
                      <option value="createdAt">Newest</option>
                      <option value="price">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="popularity">Popularity</option>
                      <option value="name">Name: A to Z</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Filters:</span>
                  {search.search && (
                    <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                      Search: {search.search}
                      <button
                        type="button"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => handleFilterChange({ search: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {search.brand && (
                    <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                      Brand: {search.brand}
                      <button
                        type="button"
                        className="ml-2 text-green-600 hover:text-green-800"
                        onClick={() => handleFilterChange({ brand: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {(search.minPrice !== undefined ||
                    search.maxPrice !== undefined) && (
                    <div className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                      Price: {formatCurrency(search.minPrice || 0)} -{' '}
                      {formatCurrency(search.maxPrice || maxPrice)}
                      <button
                        type="button"
                        className="ml-2 text-purple-600 hover:text-purple-800"
                        onClick={() =>
                          handleFilterChange({
                            minPrice: undefined,
                            maxPrice: undefined,
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {search.tags && (
                    <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                      Tag: {search.tags}
                      <button
                        type="button"
                        className="ml-2 text-amber-600 hover:text-amber-800"
                        onClick={() => handleFilterChange({ tags: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {search.categoryId && (
                    <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800">
                      Category: {search.categoryId}
                      <button
                        type="button"
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                        onClick={() =>
                          handleFilterChange({ categoryId: undefined })
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid/List */}
            {isRefreshing ? (
              <div className="py-20 text-center">
                <RefreshCw className="mx-auto h-12 w-12 animate-spin text-mmp-primary" />
                <p className="mt-4 text-gray-600">Refreshing products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-gray-400 mb-4">
                  <Filter className="mx-auto h-16 w-16" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search term to find what you're
                  looking for.
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    className="bg-mmp-primary hover:bg-mmp-primary2"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <ProductGrid products={products} />
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductListItem key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && products.length > 0 && (
              <div className="mt-12">
                {/* Desktop Pagination */}
                <div className="hidden md:block">
                  <Pagination
                    meta={meta}
                    onPageChange={handlePageChange}
                    showInfo={false}
                    showPageSize={false}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  />
                </div>
                {/* Mobile Pagination */}
                <div className="md:hidden">
                  <CompactPagination
                    meta={meta}
                    onPageChange={handlePageChange}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  />
                </div>

                {/* Page Info */}
                <div className="mt-4 text-center text-sm text-gray-600">
                  Page {meta.page} of {meta.totalPages}
                  {meta.total > 0 && <span className="mx-2">•</span>}
                  <span>{meta.total.toLocaleString()} total products</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// List View Item Component
const ProductListItem: React.FC<{ product: any }> = ({ product }) => {
  const discountedPrice = product.price * (1 - product.discount / 100)

  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block shrink-0"
      >
        <div className="h-48 w-48 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-32">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
          {product.discount > 0 && (
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                -{product.discount}%
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
          <div className="flex-1">
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="block"
            >
              <h3 className="text-lg font-semibold text-gray-900 hover:text-mmp-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase">
                {product.brand}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {product.soldCount.toLocaleString()} sold
              </span>
              <span className="text-xs text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">
                  {(product.viewCount / 100).toFixed(1)}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-3 w-3 fill-current text-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 sm:mt-0 sm:text-right">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(discountedPrice)}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            {product.discount > 0 && (
              <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 mt-1">
                Save {product.discount}%
              </span>
            )}
            <div className="mt-2 text-sm">
              {product.stock > 0 ? (
                product.stock < 10 ? (
                  <span className="text-amber-600 font-medium">
                    Only {product.stock} left!
                  </span>
                ) : (
                  <span className="text-green-600">In stock</span>
                )
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button className="bg-mmp-primary hover:bg-mmp-primary2">
            Add to Cart
          </Button>
          <Button variant="outline">Quick View</Button>
          <Button variant="ghost" size="sm">
            Save for Later
          </Button>
        </div>
      </div>
    </div>
  )
}
