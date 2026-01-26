import { createFileRoute } from '@tanstack/react-router'
import React, { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shirt,
  Watch,
  Glasses,
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { IProductListItem } from '@/types'
import { 
  sampleProducts, 
  getAllBrands, 
  getAllTags,
  categories
} from '@/data/product';
import type { HeroType } from '@/components/home'
import HeroCarousel from '@/components/home/hero-carousel'
import CategoriesCarousel from '@/components/ui/categories-carousel'
import { ProductCard } from '@/components/ui/product-card'

// Hero Carousel Data
const heroSlides: HeroType[] = [
  {
    id: '1',
    title: 'Summer Collection 2024',
    subtitle: 'Discover the Latest Trends',
    description: 'Up to 50% off on selected items. Limited time offer.',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=600&fit=crop',
    cta: 'Shop Now',
    bgColor: 'from-mmp-primary/90 to-mmp-accent/70',
    textColor: 'text-white',
  },
  {
    id: '2',
    title: 'Premium Accessories',
    subtitle: 'Elevate Your Style',
    description: 'Handcrafted jewelry and luxury watches collection',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&h=600&fit=crop',
    cta: 'Explore',
    bgColor: 'from-mmp-primary2/90 to-mmp-secondary/70',
    textColor: 'text-mmp-neutral',
  },
  {
    id: '3',
    title: 'Sustainable Fashion',
    subtitle: 'Eco-Friendly Choices',
    description: 'Organic materials, ethical production, timeless designs',
    image:
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&h=600&fit=crop',
    cta: 'Discover',
    bgColor: 'from-mmp-accent/90 to-mmp-secondary/70',
    textColor: 'text-white',
  },
]

// Icon mapping
const iconMap: Record<string, any> = {
  Shirt,
  Watch,
  Glasses,
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
}

export const Route = createFileRoute('/(root)/_rootLayout/')({
  component: HomeClient,
 loader: () => {
     const brands = getAllBrands();
     const tags = getAllTags();
     const maxPrice = Math.max(...sampleProducts.map(p => p.price), 0);
     
     return { brands, tags, maxPrice };
   },
})

export default function HomeClient() {
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleAddToCart = (product: IProductListItem) => {
    console.log('Add to cart:', product)
    // Implement cart logic here
  }

  const scrollLeft = (categoryId: string) => {
    const scrollContainer = scrollRefs.current[categoryId]
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = (categoryId: string) => {
    const scrollContainer = scrollRefs.current[categoryId]
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  // Group products by category
  const productsByCategory = categories.reduce(
    (acc, category) => {
      acc[category._id] = sampleProducts
        .filter((p) => p.categoryId === category._id)
        .slice(0, 10)
      return acc
    },
    {} as Record<string, IProductListItem[]>,
  )

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel heroSlides={heroSlides} />

      {/* Categories Section */}
      <CategoriesCarousel categories={categories} />

      {/* Featured Products by Category */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {categories.slice(0, 5).map((category) => (
            <div key={category._id} className="mb-12 last:mb-0">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {iconMap[category.icon] && (
                      <div className="p-2 rounded-lg bg-gradient-to-r from-mmp-primary/10 to-mmp-accent/10">
                        {React.createElement(iconMap[category.icon], {
                          className: 'h-5 w-5 text-mmp-accent',
                        })}
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-mmp-primary2">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-mmp-accent">
                    Discover our latest {category.name.toLowerCase()} collection
                  </p>
                </div>

                <Link
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="hidden sm:flex items-center gap-2 text-mmp-accent hover:text-mmp-secondary font-medium group"
                >
                  View All
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Products Grid - Horizontal Scroll */}
              <div className="relative">
                {/* Scroll Buttons for Desktop */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg hover:bg-mmp-neutral border-mmp-primary/20 hidden md:flex"
                  onClick={() => scrollLeft(category._id)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg hover:bg-mmp-neutral border-mmp-primary/20 hidden md:flex"
                  onClick={() => scrollRight(category._id)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Scrollable Products Container */}
                <ScrollArea className="w-full">
                  <div
                    // ref={(el) => (scrollRefs.current[category._id] = el)}
                    className="flex gap-6 pb-4"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {/* First Row - Top 5 Products */}
                    <div className="flex gap-6 min-w-full md:min-w-0">
                      {productsByCategory[category._id]
                        ?.slice(0, 5)
                        .map((product) => (
                          <div key={product._id} className="flex-none">
                            <ProductCard
                              product={product}
                              onAddToCart={handleAddToCart}
                            />
                          </div>
                        ))}
                    </div>

                    {/* Second Row - Next 5 Products + View More */}
                    <div className="flex gap-6 min-w-full md:min-w-0">
                      {productsByCategory[category._id]
                        ?.slice(5, 10)
                        .map((product) => (
                          <div key={product._id} className="flex-none">
                            <ProductCard
                              product={product}
                              onAddToCart={handleAddToCart}
                            />
                          </div>
                        ))}

                      {/* View More Card */}
                      <div className="flex-none min-w-[250px]">
                        <Link
                          to="/categories/$slug"
                          params={{ slug: category.slug }}
                        >
                          <Card className="h-full border-mmp-primary/20 hover:border-mmp-secondary/50 transition-all duration-300 hover:shadow-lg group">
                            <CardContent className="h-full p-8 flex flex-col items-center justify-center text-center">
                              <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-mmp-primary/10 to-mmp-accent/10 flex items-center justify-center group-hover:from-mmp-accent/20 group-hover:to-mmp-secondary/20 transition-all">
                                <ArrowRight className="h-8 w-8 text-mmp-accent group-hover:text-mmp-secondary transition-colors" />
                              </div>
                              <h3 className="text-xl font-bold text-mmp-primary2 mb-2">
                                View All {category.name}
                              </h3>
                              <p className="text-sm text-mmp-neutral/60 mb-4">
                                Explore our complete collection
                              </p>
                              <Badge className="bg-gradient-to-r from-mmp-accent/20 to-mmp-secondary/20 text-mmp-accent border-0">
                                {productsByCategory[category._id]?.length}+
                                items
                              </Badge>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <ScrollBar orientation="horizontal" className="md:hidden" />
                </ScrollArea>

                {/* Mobile View All Button */}
                <div className="mt-6 sm:hidden">
                  <Link
                    to="/categories/$slug"
                    params={{ slug: category.slug }}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-mmp-primary/30 hover:border-mmp-secondary/50"
                    >
                      View All {category.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <Separator className="mt-12 bg-gradient-to-r from-transparent via-mmp-primary/20 to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-mmp-primary/5 to-mmp-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-4 bg-gradient-to-r from-mmp-accent to-mmp-secondary text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Exclusive Membership
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-mmp-primary2 mb-4">
              Join Our Fashion Community
            </h2>
            <p className="text-lg text-mmp-neutral/60 mb-8">
              Get early access to sales, personalized recommendations, and
              exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-mmp-accent to-mmp-secondary hover:opacity-90 text-white border-0 px-8"
              >
                Sign Up Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-mmp-primary/30 hover:border-mmp-secondary/50 px-8"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
