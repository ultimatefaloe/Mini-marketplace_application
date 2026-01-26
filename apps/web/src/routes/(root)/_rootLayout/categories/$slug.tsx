import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';
import { ProductGrid } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { 
  getCategoryBySlug, 
  getProductsByCategorySlug,
  categories,
} from '@/data/product';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Grid3x3, List } from 'lucide-react';
import { ProductFilters } from '@/components/ui/product-filters';
import type { IProductQueryFilters } from '@/types';

export const Route = createFileRoute('/(root)/_rootLayout/categories/$slug')({
  component: CategoryProductsPage,
  validateSearch: z.object({
    page: z.number().optional(),
    search: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    tags: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
  loader: async ({ params }) => {
    const category = getCategoryBySlug(params.slug);
    if (!category) {
      throw new Error('Category not found');
    }
    
    const products = getProductsByCategorySlug(params.slug);
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
    const tags = Array.from(new Set(products.flatMap(p => p.tags)));
    const maxPrice = Math.max(...products.map(p => p.price), 0);
    
    return { category, initialProducts: products, brands, tags, maxPrice };
  },
});

function CategoryProductsPage() {
  const { category, initialProducts, brands, tags, maxPrice } = Route.useLoaderData();
  const search = Route.useSearch();
  const { slug } = Route.useParams();
  
  const [filters, setFilters] = React.useState<IProductQueryFilters>({
    ...search,
    categoryId: categories.find(c => c.slug === slug)?._id,
    page: search.page || 1,
    limit: 12,
  });
  
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [products, setProducts] = React.useState(initialProducts);

  // Filter products when filters change
  React.useEffect(() => {
    const filtered = initialProducts.filter(product => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matches = 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          product.brand?.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        if (!matches) return false;
      }

      // Brand filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }

      // Price filter
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      // Tags filter
      if (filters.tags && !product.tags.includes(filters.tags)) {
        return false;
      }

      return true;
    });

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price':
            return filters.sortOrder === 'desc' 
              ? b.price - a.price 
              : a.price - b.price;
          case 'name':
            return filters.sortOrder === 'desc'
              ? b.name.localeCompare(a.name)
              : a.name.localeCompare(b.name);
          case 'popularity':
            return filters.sortOrder === 'desc'
              ? b.soldCount - a.soldCount
              : a.soldCount - b.soldCount;
          default:
            return 0;
        }
      });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const start = (page - 1) * limit;
    const end = start + limit;

    setProducts(filtered.slice(start, end));
  }, [filters, initialProducts]);

  const handleFilterChange = (newFilters: Partial<IProductQueryFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const totalProducts = initialProducts.length;
  const currentPage = filters.page || 1;
  const totalPages = Math.ceil(totalProducts / (filters.limit || 12));

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
                  <div className="text-3xl font-bold text-white">{totalProducts}</div>
                  <div className="text-white/80 text-sm">Products Available</div>
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
                    Showing {products.length} of {totalProducts} products
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
                      value={filters.sortBy || 'createdAt'}
                      onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
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
              {(filters.search || filters.brand || filters.minPrice || filters.maxPrice || filters.tags) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {filters.search && (
                    <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                      Search: {filters.search}
                      <button
                        type="button"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        onClick={() => handleFilterChange({ search: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {filters.brand && (
                    <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                      Brand: {filters.brand}
                      <button
                        type="button"
                        className="ml-2 text-green-600 hover:text-green-800"
                        onClick={() => handleFilterChange({ brand: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                    <div className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                      Price: {formatCurrency(filters.minPrice || 0)} - {formatCurrency(filters.maxPrice || maxPrice)}
                      <button
                        type="button"
                        className="ml-2 text-purple-600 hover:text-purple-800"
                        onClick={() => handleFilterChange({ minPrice: undefined, maxPrice: undefined })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {filters.tags && (
                    <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                      Tag: {filters.tags}
                      <button
                        type="button"
                        className="ml-2 text-amber-600 hover:text-amber-800"
                        onClick={() => handleFilterChange({ tags: '' })}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
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
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center">
                <nav className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handleFilterChange({ page: currentPage - 1 })}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange({ page: pageNum })}
                        className={currentPage === pageNum ? 'bg-mmp-primary' : ''}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handleFilterChange({ page: currentPage + 1 })}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// List View Item Component
const ProductListItem: React.FC<{ product: any }> = ({ product }) => {
  const discountedPrice = product.price * (1 - product.discount / 100);
  
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
  );
};