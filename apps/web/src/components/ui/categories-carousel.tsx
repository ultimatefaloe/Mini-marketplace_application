import { Badge } from './badge'
import { Sparkles } from 'lucide-react'
import { ScrollArea, ScrollBar } from './scroll-area'
import { Link } from '@tanstack/react-router'
import { Card } from './card'
import type { ICategoryTreeNode } from '@/types'

interface CategoryProps {
  categories: ICategoryTreeNode[]
}

const CategoriesCarousel = ({ categories }: CategoryProps) => {
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header Section - More compact */}
        <div className="text-center mb-6 md:mb-8">
          <Badge className="mb-2 bg-gradient-to-r from-mmp-primary/20 to-mmp-accent/20 text-mmp-primary border-0 text-xs px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Browse Collections
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-mmp-primary2 mb-2">
            Shop By Category
          </h2>
          <p className="text-mmp-neutral/60 text-sm md:text-base max-w-md mx-auto">
            Discover our carefully curated fashion collections
          </p>
        </div>

        {/* Categories Container */}
        <div className="relative md:hidden">
          <ScrollArea className="w-full">
            <div className="flex gap-3 min-w-max pb-2 md:pb-0">
              {categories.map((category) => {
                // Use the icon field as image URL
                const imageUrl = category.icon || '/placeholder-category.jpg'
                
                return (
                  <Link
                    key={category._id}
                    to="/categories/$slug"
                    params={{ slug: category.slug }}
                    className="block w-[150px] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-mmp-secondary focus-visible:ring-offset-2 rounded-xl"
                  >
                    <Card className="h-full border-mmp-primary/10 hover:border-mmp-secondary/50 transition-all duration-300 overflow-hidden bg-white shadow-sm hover:shadow-md active:scale-[0.98] p-0">
                      {/* Image Container */}
                      <div className="relative h-32 w-full overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-category.jpg'
                          }}
                        />
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                        
                        {/* Category Name */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="font-semibold text-white text-sm leading-tight drop-shadow-md">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" className="h-1" />
          </ScrollArea>
        </div>

        {/* Desktop Grid - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
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
      </div>
    </section>
  )
}

export default CategoriesCarousel