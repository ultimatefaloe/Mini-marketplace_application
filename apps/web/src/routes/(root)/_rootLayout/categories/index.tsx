import { categoriesQuery } from '@/api/queries'
import { Card } from '@/components/ui/card'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Sparkles as SparklesIcon, Zap, Plus } from 'lucide-react'


export const Route = createFileRoute('/(root)/_rootLayout/categories/')({
  component: CategoriesPage,
  loader: async ({ context }) => {
   return context.queryClient.ensureQueryData(categoriesQuery())
  },
})

function CategoriesPage() {
  const categories = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-mmp-primary to-mmp-primary2 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore All Categories
            </h1>
            <p className="text-lg opacity-90">
              Browse through our extensive collection of products. We're
              constantly adding new categories to bring you more options!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
          {categories.map((category) => {
            const imageUrl = category.icon || '/placeholder-category.jpg'

            return (
              <Link
                key={category._id}
                to="/categories/$slug"
                params={{ slug: category.slug }}
                className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-mmp-secondary focus-visible:ring-offset-2 rounded-xl"
              >
                <Card className="h-full border-mmp-primary/10 hover:border-mmp-secondary/50 transition-all duration-300 overflow-hidden bg-white shadow-sm hover:shadow-lg hover:translate-y-[-2px] p-0">
                  <div className="relative h-36 w-full overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-category.jpg'
                      }}
                    />
                    {/* Dark overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                    {/* Category Name with hover effect */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 group-hover:translate-y-[-4px]">
                      <h3 className="font-semibold text-white text-base leading-tight drop-shadow-lg">
                        {category.name}
                      </h3>
                      <p className="text-xs text-white/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Shop Now →
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-12">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-mmp-primary mb-1">
              {categories.length}+
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-mmp-accent mb-1">50+</div>
            <div className="text-sm text-gray-600">Coming Soon</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-mmp-secondary mb-1">
              10K+
            </div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-500 mb-1">24/7</div>
            <div className="text-sm text-gray-600">New Additions</div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How Categories Work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-mmp-primary/10 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-mmp-primary" />
              </div>
              <h3 className="font-semibold text-gray-900">Curated Selection</h3>
              <p className="text-gray-600">
                Each category is carefully curated to bring you the best
                products from trusted sellers.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-mmp-secondary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-mmp-secondary" />
              </div>
              <h3 className="font-semibold text-gray-900">Fast Navigation</h3>
              <p className="text-gray-600">
                Quickly find what you're looking for with our organized category
                structure.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-mmp-accent/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-mmPlusp-accent" />
              </div>
              <h3 className="font-semibold text-gray-900">Growing Daily</h3>
              <p className="text-gray-600">
                We add new categories regularly based on customer requests and
                market trends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
