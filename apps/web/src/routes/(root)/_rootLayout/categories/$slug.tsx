import  { useState, useCallback } from 'react';
import { ProductCard } from '@/components/ui/product-card';
import { Pagination, CompactPagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, Search, Grid, List, Star, TrendingUp, Clock, 
  ChevronDown, X, ShoppingBag, Tag
} from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import type { IPaginationMeta, IProductListItem } from '@/types';

// Sample data
const sampleProducts: IProductListItem[] = Array.from({ length: 50 }, (_, i) => ({
  _id: `prod_${String(i + 1).padStart(3, '0')}`,
  name: [
    'Premium Leather Jacket',
    'Silk Evening Dress',
    'Designer Sneakers',
    'Luxury Watch',
    'Handbag Collection',
    'Sunglasses Pro',
    'Gold Necklace',
    'Yoga Outfit Set',
    'Designer Suit',
    'Casual T-Shirt',
    'Winter Coat',
    'Summer Dress',
    'Running Shoes',
    'Smart Watch',
    'Backpack',
    'Prescription Glasses',
    'Diamond Ring',
    'Gym Wear',
    'Formal Shirt',
    'Denim Jacket',
  ][i % 20],
  slug: `product-${i + 1}`,
  description: 'Premium fashion item with excellent quality and design. Made with sustainable materials and perfect for everyday wear or special occasions.',
  categoryId: `cat_${String(Math.floor(i / 10) + 1).padStart(3, '0')}`,
  brand: ['FashionKet', 'LuxStyle', 'UrbanWear', 'ClassicMode', 'TrendSet'][i % 5],
  price: [
    89.99, 129.99, 199.99, 299.99, 49.99, 159.99, 399.99, 79.99, 249.99, 99.99,
  ][i % 10],
  discount: i % 3 === 0 ? [10, 20, 30, 40, 50][i % 5] : 0,
  stock: Math.floor(Math.random() * 50) + 10,
  images: [
    `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=500&fit=crop`,
    `https://images.unsplash.com/photo-${1500000000001 + i}?w=400&h=500&fit=crop`,
  ],
  isActive: true,
  tags: ['fashion', 'premium', 'trending', 'new', 'sustainable'],
  viewCount: Math.floor(Math.random() * 1000) + 100,
  soldCount: Math.floor(Math.random() * 500) + 50,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-15',
}));

// Category mapping
const categoryMap: Record<string, { name: string; description: string }> = {
  'mens-clothing': {
    name: "Men's Clothing",
    description: "Explore our collection of premium men's clothing including shirts, pants, jackets, and more."
  },
  'womens-clothing': {
    name: "Women's Clothing",
    description: "Discover stylish women's fashion including dresses, tops, skirts, and accessories."
  },
  'footwear': {
    name: "Footwear",
    description: "Find the perfect shoes for every occasion from sneakers to formal wear."
  },
  'accessories': {
    name: "Accessories",
    description: "Complete your look with our selection of watches, belts, and other accessories."
  },
  'bags-luggage': {
    name: "Bags & Luggage",
    description: "Carry your essentials in style with our range of bags and luggage."
  }
};

export const Route = createFileRoute('/(root)/_rootLayout/categories/$slug')({
  component: CategoryProductsPage,
  params: {
    parse: (params) =>
      z.object({
        slug: z.string().min(1),
      }).parse(params),
  },
  loader: async ({ params }) => {
    // In a real app, fetch category and products here
    const category = categoryMap[params.slug] || {
      name: params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: "Explore our collection of products in this category."
    };
    
    return { category };
  },
});

// Sorting options
const sortOptions = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'discount', label: 'Best Discount' },
];

function CategoryProductsPage() {
  const { category } = Route.useLoaderData();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<IPaginationMeta>({
    page: 1,
    limit: 12,
    total: sampleProducts.length,
    totalPages: Math.ceil(sampleProducts.length / 12)
  });

  // Filter products
  const filteredProducts = useCallback(() => {
    let products = [...sampleProducts];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by price range
    products = products.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    
    // Filter by brands
    if (selectedBrands.length > 0) {
      products = products.filter(p => 
        p.brand && selectedBrands.includes(p.brand)
      );
    }
    
    // Sort products
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => (a.price * (1 - a.discount / 100)) - (b.price * (1 - b.discount / 100)));
        break;
      case 'price-high':
        products.sort((a, b) => (b.price * (1 - b.discount / 100)) - (a.price * (1 - a.discount / 100)));
        break;
      case 'popular':
        products.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case 'rating':
        const getRating = (p: IProductListItem) => p.viewCount > 0 ? (p.soldCount / p.viewCount) * 5 : 0;
        products.sort((a, b) => getRating(b) - getRating(a));
        break;
      case 'discount':
        products.sort((a, b) => b.discount - a.discount);
        break;
      default: // newest
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return products;
  }, [searchQuery, sortBy, priceRange, selectedBrands]);

  // Paginate products
  const paginatedProducts = filteredProducts().slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle add to cart
  const handleAddToCart = (product: IProductListItem) => {
    console.log('Added to cart:', product);
    // Implement cart logic here
  };

  // Extract unique brands
  const allBrands = Array.from(new Set(sampleProducts.map(p => p.brand).filter(Boolean))) as string[];

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 500]);
    setSelectedBrands([]);
    setSortBy('newest');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-mmp-primary to-mmp-primary2 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-2 opacity-90">
                <a href="/" className="hover:underline">Home</a>
                <ChevronDown className="w-4 h-4 rotate-270" />
                <a href="/categories" className="hover:underline">Categories</a>
                <ChevronDown className="w-4 h-4 rotate-270" />
                <span className="font-medium">{category.name}</span>
              </nav>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {category.name}
              </h1>
              <p className="opacity-90 max-w-2xl">
                {category.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm">
                <ShoppingBag className="w-3 h-3 mr-1" />
                {filteredProducts().length} Products
              </Badge>
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm">
                <Tag className="w-3 h-3 mr-1" />
                24/7 Support
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products, brands, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {selectedBrands.length > 0 && (
                  <Badge className="ml-2 bg-mmp-accent text-white">
                    {selectedBrands.length}
                  </Badge>
                )}
              </Button>

              {/* View Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-r-none ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-l-none ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Reset Filters */}
              {(searchQuery || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 500) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg md:hidden">
              <div className="space-y-4">
                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="my-4"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-medium mb-2">Brands</h3>
                  <div className="space-y-2">
                    {allBrands.map((brand) => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </Button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="my-4"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Brands</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allBrands.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{brand}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        ({sampleProducts.filter(p => p.brand === brand).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Category Stats</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Products</span>
                    <span className="font-medium">{sampleProducts.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Price</span>
                    <span className="font-medium">
                      ${(sampleProducts.reduce((sum, p) => sum + p.price, 0) / sampleProducts.length).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">In Stock</span>
                    <span className="font-medium">
                      {sampleProducts.filter(p => p.stock > 0).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Found {filteredProducts().length} products
                  </p>
                </div>
                
                {/* Active Filters */}
                <div className="flex flex-wrap gap-2">
                  {priceRange[0] > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      From ${priceRange[0]}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, priceRange[1]])} />
                    </Badge>
                  )}
                  {priceRange[1] < 500 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      To ${priceRange[1]}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([priceRange[0], 500])} />
                    </Badge>
                  )}
                  {selectedBrands.map((brand) => (
                    <Badge key={brand} variant="secondary" className="flex items-center gap-1">
                      {brand}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => 
                        setSelectedBrands(selectedBrands.filter(b => b !== brand))
                      } />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Sort Options */}
              <div className="flex flex-wrap gap-2">
                {['popular', 'discount', 'newest'].map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className={sortBy === option ? 'border-mmp-primary text-mmp-primary' : ''}
                    onClick={() => setSortBy(option)}
                  >
                    {option === 'popular' && <TrendingUp className="w-3 h-3 mr-1" />}
                    {option === 'discount' && <Tag className="w-3 h-3 mr-1" />}
                    {option === 'newest' && <Clock className="w-3 h-3 mr-1" />}
                    {sortOptions.find(o => o.value === option)?.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Products Grid/List */}
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button onClick={resetFilters}>
                  Reset All Filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product._id.toString()}
                    product={product}
                    onAddToCart={handleAddToCart}
                    className="h-full"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {paginatedProducts.map((product) => (
                  <div key={product._id.toString()} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex gap-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {product.brand}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              {product.viewCount > 0 ? ((product.soldCount / product.viewCount) * 5).toFixed(1) : '0.0'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({product.soldCount} sold)
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <div className="text-lg font-bold text-mmp-primary">
                            ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </div>
                          {product.discount > 0 && (
                            <div className="text-sm text-gray-500 line-through">
                              ${product.price.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-mmp-primary hover:bg-mmp-primary2"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8">
              {/* Desktop Pagination */}
              <div className="hidden md:block">
                <Pagination
                  meta={pagination}
                  onPageChange={handlePageChange}
                  showPageSize
                />
              </div>
              
              {/* Mobile Pagination */}
              <div className="md:hidden">
                <CompactPagination
                  meta={pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}