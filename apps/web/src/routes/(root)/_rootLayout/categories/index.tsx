import CategoriesCarousel from '@/components/ui/categories-carousel'
import { createFileRoute } from '@tanstack/react-router'
import {
  Sparkles as SparklesIcon,
  Zap,
  Plus,
} from 'lucide-react'

// This would typically come from an API
const categories = [
  {
    _id: 'cat_001',
    name: "Men's Clothing",
    slug: 'mens-clothing',
    icon: 'Shirt',
    order: 1,
  },
  {
    _id: 'cat_002',
    name: "Women's Clothing",
    slug: 'womens-clothing',
    icon: 'Dress',
    order: 2,
  },
  {
    _id: 'cat_003',
    name: 'Footwear',
    slug: 'footwear',
    icon: 'Shoe',
    order: 3,
  },
  {
    _id: 'cat_004',
    name: 'Accessories',
    slug: 'accessories',
    icon: 'Watch',
    order: 4,
  },
  {
    _id: 'cat_005',
    name: 'Bags & Luggage',
    slug: 'bags-luggage',
    icon: 'Bag',
    order: 5,
  },
  {
    _id: 'cat_006',
    name: 'Eyewear',
    slug: 'eyewear',
    icon: 'Glasses',
    order: 6,
  },
  {
    _id: 'cat_007',
    name: 'Jewelry',
    slug: 'jewelry',
    icon: 'Sparkles',
    order: 7,
  },
  {
    _id: 'cat_008',
    name: 'Activewear',
    slug: 'activewear',
    icon: 'Zap',
    order: 8,
  },
  {
    _id: 'cat_009',
    name: 'Luxury',
    slug: 'luxury',
    icon: 'Crown',
    order: 9,
  },
  {
    _id: 'cat_010',
    name: 'Trending',
    slug: 'trending',
    icon: 'TrendingUp',
    order: 10,
  },
  {
    _id: 'cat_011',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Smartphone',
    order: 11,
  },
  {
    _id: 'cat_012',
    name: 'Home & Living',
    slug: 'home-living',
    icon: 'Home',
    order: 12,
  },
]

export const Route = createFileRoute('/(root)/_rootLayout/categories/')({
  component: CategoriesPage,
  loader: async () => {
    // In a real app, you would fetch this from an API
    return categories
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
        <CategoriesCarousel categories={categories} />

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
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
