import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Package } from 'lucide-react'
import { toast } from 'react-toastify'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState } from '@/components/ui/error-state'
import { ProductForm } from '@/components/forms/product-form'
import { categoriesQuery } from '@/api/queries'
import { useCreateProduct } from '@/api/mutations'

export const Route = createFileRoute(
  '/(vendor)/vendor/_vendorLayout/products/new',
)({
  component: NewProduct,
  pendingComponent: LoadingState,
  errorComponent: ErrorState,
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(categoriesQuery())
  },
})

function NewProduct() {
  const navigate = useNavigate()
  const categories = Route.useLoaderData()
  const { mutateAsync: createProduct, isPending } = useCreateProduct()

  // Handle form submission
  const handleSubmit = async (data: FormData) => {
    try {
      await createProduct(data)
      navigate({ to: '/vendor/products' })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/vendor/products' })}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-mmp-primary/10 to-mmp-primary2/10">
                <Package className="h-6 w-6 text-mmp-primary" />
              </div>
              <h1 className="text-3xl font-bold text-mmp-primary2">
                Add New Product
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              Create a new product for your FashionKet store
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate({ to: '/vendor/products' })}
          className="hidden sm:flex"
        >
          View All Products
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-sm text-gray-600">
        <span
          className="cursor-pointer hover:text-mmp-primary"
          onClick={() => navigate({ to: '/vendor' })}
        >
          Dashboard
        </span>
        <span className="mx-2">/</span>
        <span
          className="cursor-pointer hover:text-mmp-primary"
          onClick={() => navigate({ to: '/vendor/products' })}
        >
          Products
        </span>
        <span className="mx-2">/</span>
        <span className="font-medium text-mmp-primary2">Add New</span>
      </div>

      {/* Stats Card */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="text-sm font-medium text-blue-800">
            Required Fields
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">5</div>
          <div className="text-xs text-blue-700">
            Name, Category, Price, Stock, Images
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="text-sm font-medium text-green-800">
            Image Guidelines
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">8 max</div>
          <div className="text-xs text-green-700">
            10MB each, first image is main
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="text-sm font-medium text-purple-800">Tips</div>
          <div className="text-xs text-purple-700">
            Use high-quality images, accurate descriptions, and competitive
            pricing
          </div>
        </div>
      </div>

      {/* Product Form */}
      <div className="">
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isPending}
          isUpdate={false}
        />
      </div>

      {/* Quick Tips */}
      <div className="mt-8 p-6 bg-gradient-to-r from-mmp-primary/5 to-mmp-primary2/5 rounded-xl border border-mmp-primary/20">
        <h3 className="text-lg font-semibold text-mmp-primary2 mb-3">
          💡 Tips for Better Product Listings
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Use high-resolution images from multiple angles</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>
              Write detailed descriptions with key features and benefits
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Set competitive pricing based on market research</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Add relevant tags to improve search visibility</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Specify accurate stock levels to avoid overselling</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
