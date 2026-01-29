import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { ProductGrid } from '@/components/ui/product-card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Grid3x3, List } from 'lucide-react'
import { ProductFilters } from '@/components/ui/product-filters'
import type { IProductQueryFilters } from '@/types'
import {
  categoriesQuery,
  categoryBySlugQuery,
  productsQuery,
} from '@/api/queries'
import { useProducts } from '@/api/hooks'
import { Pagination } from '@/components/ui/pagination'

// Search params schema
const productSearchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(12),
  search: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  tags: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const Route = createFileRoute('/(root)/_rootLayout/categories/$slug')({
  component: CategoryProductsPage,
  validateSearch: productSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, params, deps }) => {
    const categories =
      await context.queryClient.ensureQueryData(categoriesQuery())
    const category = await context.queryClient.ensureQueryData(
      categoryBySlugQuery(params.slug),
    )
    
    if (!category) {
      throw new Error('Category not found')
    }

    // Build filters from search params
    const filters: IProductQueryFilters = {
      categorySlug: params.slug,
      page: deps.search.page,
      limit: deps.search.limit,
      search: deps.search.search,
      brand: deps.search.brand,
      minPrice: deps.search.minPrice,
      maxPrice: deps.search.maxPrice,
      tags: deps.search.tags,
      sortBy: deps.search.sortBy,
      sortOrder: deps.search.sortOrder,
    }

    // Fetch products with filters
    const productsData = await context.queryClient.ensureQueryData(
      productsQuery(filters),
    )

    // Extract metadata from initial load (for filter options)
    const allProductsData = await context.queryClient.ensureQueryData(
      productsQuery({ categorySlug: params.slug, limit: 1000 }),
    )
    
    const allProducts = allProductsData.data
    const brands = Array.from(
      new Set(allProducts.map((p) => p.brand).filter(Boolean)),
    ) as string[]
    const tags = Array.from(new Set(allProducts.flatMap((p) => p.tags)))
    const maxPrice = Math.max(...allProducts.map((p) => p.price), 0)

    return {
      categories,
      category,
      initialProducts: productsData.data,
      initialPagination: productsData.pagination,
      brands,
      tags,
      maxPrice,
    }
  },
})

function CategoryProductsPage() {
  const {
    category,
    initialProducts,
    initialPagination,
    brands,
    tags,
    maxPrice,
  } = Route.useLoaderData()
  
  const searchParams = Route.useSearch()
  const { slug } = Route.useParams()
  const navigate = Route.useNavigate()

  // Initialize filters from URL search params
  const [filters, setFilters] = React.useState<IProductQueryFilters>({
    categorySlug: slug,
    page: searchParams.page || 1,
    limit: searchParams.limit || 12,
    search: searchParams.search,
    brand: searchParams.brand,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    tags: searchParams.tags,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  })

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  // Fetch products with current filters
  const {
    data: productsResponse,
    isLoading,
    isFetching,
  } = useProducts(filters)

  // Use fetched products or fallback to initial
  const products = productsResponse?.data ?? initialProducts
  const pagination = productsResponse?.pagination ?? initialPagination

  // Sync filters with URL search params
  React.useEffect(() => {
    const newFilters: IProductQueryFilters = {
      categorySlug: slug,
      page: searchParams.page || 1,
      limit: searchParams.limit || 12,
      search: searchParams.search,
      brand: searchParams.brand,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      tags: searchParams.tags,
      sortBy: searchParams.sortBy,
      sortOrder: searchParams.sortOrder,
    }
    
    setFilters(newFilters)
  }, [
    slug,
    searchParams.page,
    searchParams.limit,
    searchParams.search,
    searchParams.brand,
    searchParams.minPrice,
    searchParams.maxPrice,
    searchParams.tags,
    searchParams.sortBy,
    searchParams.sortOrder,
  ])

  /**
   * Update filters and URL search params
   */
  const handleFilterChange = (newFilters: Partial<IProductQueryFilters>) => {
    // Build updated search params
    const updatedSearch: Record<string, any> = {
      ...searchParams,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }

    // Remove undefined values
    Object.keys(updatedSearch).forEach((key) => {
      if (updatedSearch[key] === undefined || updatedSearch[key] === '') {
        delete updatedSearch[key]
      }
    })

    // Update URL
    navigate({
      search: updatedSearch,
      replace: true,
    })
  }

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
      replace: true,
    })
  }

  /**
   * Handle sort change
   */
  const handleSortChange = (sortValue: string) => {
    let sortBy: string
    let sortOrder: 'asc' | 'desc' = 'asc'

    switch (sortValue) {
      case 'price':
        sortBy = 'price'
        sortOrder = 'asc'
        break
      case 'price_desc':
        sortBy = 'price'
        sortOrder = 'desc'
        break
      case 'popularity':
        sortBy = 'soldCount'
        sortOrder = 'desc'
        break
      case 'name':
        sortBy = 'name'
        sortOrder = 'asc'
        break
      case 'createdAt':
      default:
        sortBy = 'createdAt'
        sortOrder = 'desc'
        break
    }

    handleFilterChange({ sortBy, sortOrder })
  }

  /**
   * Get current sort value for select
   */
  const getCurrentSortValue = () => {
    const { sortBy, sortOrder } = filters
    
    if (sortBy === 'price' && sortOrder === 'asc') return 'price'
    if (sortBy === 'price' && sortOrder === 'desc') return 'price_desc'
    if (sortBy === 'soldCount') return 'popularity'
    if (sortBy === 'name') return 'name'
    return 'createdAt'
  }

  const totalProducts = pagination?.total || 0
  const hasActiveFilters =
    filters.search ||
    filters.brand ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.tags

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-mmp-primary to-mmp-primary2">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 text-white/90 hover:text-white hover:bg-white/20"
                asChild
              >
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Categories
                </Link>
              </Button>
              <h1 className="text-4xl font-bold mb-3">{category.name}</h1>
              <p className="text-white/80 max-w-2xl">
                Explore our premium collection of {category.name.toLowerCase()}.
                Find the perfect items that match your style and budget.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {totalProducts}
                  </div>
                  <div className="text-white/80 text-sm">
                    Products Available
                  </div>
                </div>
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
              filters={filters}
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
                    {category.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {isFetching ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-mmp-primary" />
                        Loading...
                      </span>
                    ) : (
                      <>
                        Showing {products.length} of {totalProducts} products
                      </>
                    )}
                  </p>
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
                      value={getCurrentSortValue()}
                      onChange={(e) => handleSortChange(e.target.value)}
                      disabled={isFetching}
                    >
                      <option value="createdAt">Newest</option>
                      <option value="price">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="popularity">Popularity</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {filters.search && (
                    <FilterBadge
                      label="Search"
                      value={filters.search}
                      onRemove={() => handleFilterChange({ search: undefined })}
                      color="blue"
                    />
                  )}
                  {filters.brand && (
                    <FilterBadge
                      label="Brand"
                      value={filters.brand}
                      onRemove={() => handleFilterChange({ brand: undefined })}
                      color="green"
                    />
                  )}
                  {(filters.minPrice !== undefined ||
                    filters.maxPrice !== undefined) && (
                    <FilterBadge
                      label="Price"
                      value={`${formatCurrency(filters.minPrice || 0)} - ${formatCurrency(filters.maxPrice || maxPrice)}`}
                      onRemove={() =>
                        handleFilterChange({
                          minPrice: undefined,
                          maxPrice: undefined,
                        })
                      }
                      color="purple"
                    />
                  )}
                  {filters.tags && (
                    <FilterBadge
                      label="Tag"
                      value={filters.tags}
                      onRemove={() => handleFilterChange({ tags: undefined })}
                      color="amber"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && products.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-mmp-primary mx-auto mb-4" />
                  <p className="text-gray-600">Loading products...</p>
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  onClick={() => {
                    navigate({
                      search: { page: 1, limit: 12 },
                      replace: true,
                    })
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Products Grid/List */}
            {!isLoading && products.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <ProductGrid products={products} />
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <ProductListItem key={product._id} product={product} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      meta={pagination}
                      onPageChange={handlePageChange}
                      showInfo={true}
                      showPageSize={false}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter Badge Component
const FilterBadge: React.FC<{
  label: string
  value: string
  onRemove: () => void
  color: 'blue' | 'green' | 'purple' | 'amber'
}> = ({ label, value, onRemove, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    amber: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${colorClasses[color]}`}
    >
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      <button
        type="button"
        className="ml-1 hover:scale-110 transition-transform"
        onClick={onRemove}
      >
        ×
      </button>
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
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
          <div>
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="block"
            >
              <h3 className="text-lg font-semibold text-gray-900 hover:text-mmp-primary">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase">
                {product.brand}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {product.soldCount} sold
              </span>
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
              <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                Save {product.discount}%
              </span>
            )}
            <div className="mt-2 text-sm text-gray-600">
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock} in stock</span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-3">
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