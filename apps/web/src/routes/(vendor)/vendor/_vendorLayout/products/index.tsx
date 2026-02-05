import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { vendorProductsQuery } from '@/api/queries'
import { useDeleteProduct } from '@/api/mutations'
import {
  Plus,
  Package,
  TrendingUp,
  AlertCircle,
  DollarSign,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { StatsCard } from '@/components/ui/stats-card'
import { ProductFilters } from '@/components/ui/product-filters'
import { ProductGrid } from '@/components/ui/product-card'
import { z } from 'zod'

export const productSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12).optional(),
  search: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(),
  sortBy: z.string().default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
})

export type IProductQueryFilters = z.infer<typeof productSearchSchema>

export const Route = createFileRoute(
  '/(vendor)/vendor/_vendorLayout/products/',
)({
  validateSearch: (search) => {
    return productSearchSchema.parse(search)
  },
  loaderDeps: ({ search }) => ({
    search: search,
  }),
  loader: async ({ context, deps }) => {
    return await context.queryClient.ensureQueryData(vendorProductsQuery(deps.search))
  },
  component: VendorProducts,
  pendingComponent: LoadingState,
  errorComponent: ErrorState,
})

function VendorProducts() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const data = Route.useLoaderData()
  const { mutateAsync: deleteProduct } = useDeleteProduct()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const products = data?.data || []
  const meta = data?.pagination

  // Calculate stats
  const totalProducts = meta?.total || 0
  const activeProducts = products.filter((p) => p.isActive).length
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= 10,
  ).length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  const handlePageChange = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    })
  }

  const handleFilterChange = (filters: Partial<IProductQueryFilters>) => {
    navigate({
      search: (prev) => ({ ...prev, ...filters, page: 1 }),
    })
  }

  const handleEdit = (productId: string) => {
    const product = products.find((p) => p._id.toString() === productId)
    if (product) {
      navigate({
        to: '/vendor/products/$slug',
        params: { slug: product.slug },
      })
    }
  }

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  // Get unique brands and tags for filters
  const brands = Array.from(
    new Set(products.filter((p) => p.brand).map((p) => p.brand!)),
  )
  const tags = Array.from(new Set(products.flatMap((p) => p.tags)))
  const maxPrice = Math.max(...products.map((p) => p.price), 100000)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-mmp-primary2">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/vendor/products/new' })}
          className="bg-mmp-primary hover:bg-mmp-primary2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
        />
        <StatsCard
          title="Active Products"
          value={activeProducts}
          icon={TrendingUp}
        />
        <StatsCard
          title="Low Stock"
          value={lowStockProducts}
          icon={AlertCircle}
          className="border-amber-200"
        />
        <StatsCard
          title="Total Value"
          value={`₦${(totalValue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
        />
      </div>

      {/* Filters and Products */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <ProductFilters
            filters={search}
            onFilterChange={handleFilterChange}
            brands={brands}
            tags={tags}
            maxPrice={maxPrice}
          />
        </div>

        <div className="flex-1 space-y-6">
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first product
              </p>
              <Button
                onClick={() => navigate({ to: '/vendor/products/new' })}
                className="bg-mmp-primary hover:bg-mmp-primary2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />

              {meta && meta.totalPages > 1 && (
                <Pagination
                  meta={meta}
                  onPageChange={handlePageChange}
                  showInfo
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
