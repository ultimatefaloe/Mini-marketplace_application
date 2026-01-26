import { Badge } from './badge'
import {
  ArrowRight,
  Shirt,
  Watch,
  Glasses,
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
} from 'lucide-react'
import { ScrollArea, ScrollBar } from './scroll-area'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from './card'
import type { ICategoryTreeNode } from '@/types'

const iconMap: Record<string, any> = {
  Shirt,
  Watch,
  Glasses,
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
}

interface CategoryProps {
  categories: ICategoryTreeNode[]
}
const CategoriesCarousel = ({ categories }: CategoryProps) => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <Badge className="mb-3 bg-gradient-to-r from-mmp-primary/20 to-mmp-accent/20 text-mmp-primary border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Browse Collections
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-mmp-primary2 mb-3">
            Shop By Category
          </h2>
          <p className="text-mmp-neutral/60 max-w-2xl mx-auto">
            Discover our carefully curated fashion collections across all
            categories
          </p>
        </div>

        {/* Mobile Carousel Container */}
        <div className="md:hidden relative">
          <ScrollArea className="w-full pb-4">
            <div className="flex gap-3 min-w-max">
              {categories.map((category) => {
                const Icon = iconMap[category.icon]
                return (
                  <Link
                    key={category._id}
                    to="/categories/$slug"
                    params={{ slug: category.slug }}
                    className="block w-[140px] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-mmp-secondary focus-visible:ring-offset-2 rounded-xl"
                  >
                    <Card className="h-full border-mmp-primary/10 hover:border-mmp-secondary/50 transition-all duration-300 hover:shadow-md active:scale-95 overflow-hidden bg-white">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 mb-3 rounded-full bg-gradient-to-br from-mmp-primary/10 to-mmp-accent/10 flex items-center justify-center">
                          {Icon && <Icon className="h-6 w-6 text-mmp-accent" />}
                        </div>
                        <h3 className="font-semibold text-mmp-primary2 text-sm line-clamp-2 h-10">
                          {category.name}
                        </h3>
                        <p className="text-xs text-mmp-neutral/60 mt-1">
                          Shop Now
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = iconMap[category.icon]
            return (
              <Link
                key={category._id}
                to="/categories/$slug"
                params={{ slug: category.slug }}
                className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-mmp-secondary focus-visible:ring-offset-2 rounded-xl"
              >
                <Card className="h-full border-mmp-primary/10 hover:border-mmp-secondary/50 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] overflow-hidden bg-white">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-mmp-primary/10 to-mmp-accent/10 flex items-center justify-center group-hover:from-mmp-accent/20 group-hover:to-mmp-secondary/20 transition-all duration-300">
                      {Icon && (
                        <Icon className="h-7 w-7 text-mmp-accent group-hover:text-mmp-secondary transition-colors" />
                      )}
                    </div>
                    <h3 className="font-semibold text-mmp-primary2 group-hover:text-mmp-secondary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-mmp-neutral/60 mt-2">
                      Explore collection
                    </p>
                  </CardContent>
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
