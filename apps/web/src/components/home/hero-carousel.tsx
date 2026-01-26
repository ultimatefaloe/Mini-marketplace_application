import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Sparkles } from "lucide-react"

export type HeroType = {
  id: string,
  title: string,
  subtitle: string,
  description: string,
  textColor: string, 
  bgColor: string,
  cta: string,
  image: string
}
interface HeroProps {
  heroSlides: HeroType[]
}

const HeroCarousel = ({heroSlides}: HeroProps) => {
  return (
    <section className="relative overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} mix-blend-multiply`}
                  />
                </div>

                {/* Content */}
                <div className="relative h-full container mx-auto px-4 flex items-center">
                  <div className="max-w-2xl">
                    <Badge className="mb-4 bg-white/20 text-white backdrop-blur-sm border-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New Collection
                    </Badge>

                    <h1
                      className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 ${slide.textColor}`}
                    >
                      {slide.title}
                    </h1>

                    <h2
                      className={`text-xl md:text-2xl font-semibold mb-3 ${slide.textColor}`}
                    >
                      {slide.subtitle}
                    </h2>

                    <p
                      className={`text-lg mb-8 ${slide.textColor} opacity-90 max-w-lg`}
                    >
                      {slide.description}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <Button
                        size="lg"
                        className="bg-white text-mmp-primary2 hover:bg-mmp-neutral border-0 px-8"
                      >
                        {slide.cta}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className={`border-2 ${slide.textColor} hover:bg-white/20`}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/80 hover:bg-white border-0 shadow-lg" />
        <CarouselNext className="right-4 bg-white/80 hover:bg-white border-0 shadow-lg" />
      </Carousel>
    </section>
  )
}

export default HeroCarousel
