import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, Clock } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Link from "next/link";
import { NAVBAR_HEIGHT } from "@/constants/navbar";

const heroSlides = [
  {
    id: 1,
    title: "Fresh Groceries\nDelivered to Your Door",
    subtitle:
      "Get farm-fresh produce and daily essentials from your nearest store",
    cta: "Shop Now",
    ctaLink: "/products",
    badge: "Free Delivery on Orders Above Rp 200k",
    emoji: "🥗",
    decorations: ["🥕", "🍎", "🥦", "🍋"],
  },
  {
    id: 2,
    title: "Weekly Deals\nUp to 50% Off",
    subtitle: "Don't miss out on incredible savings on your favorite products",
    cta: "View Deals",
    ctaLink: "/deals",
    badge: "Limited Time Offer",
    emoji: "🛒",
    decorations: ["🍕", "🧀", "🥛", "🍞"],
  },
  {
    id: 3,
    title: "Buy 1 Get 1 Free\nOn Selected Items",
    subtitle: "Stock up on essentials with our exclusive BOGO promotions",
    cta: "Shop BOGO",
    ctaLink: "/deals",
    badge: "Special Promo",
    emoji: "🎁",
    decorations: ["🍇", "🍊", "🥑", "🍓"],
  },
  {
    id: 4,
    title: "Fresh From\nLocal Farms",
    subtitle:
      "Supporting local farmers with organic and sustainably grown produce",
    cta: "Explore Organic",
    ctaLink: "/categories",
    badge: "100% Organic",
    emoji: "🌾",
    decorations: ["🥬", "🍅", "🌽", "🥒"],
  },
];

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Same day delivery available",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Fresh products or your money back",
  },
  {
    icon: Clock,
    title: "24/7 Service",
    description: "Shop anytime, anywhere",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Carousel */}
      <div
        className={`bg-gradient-to-br h-[calc(100vh-${NAVBAR_HEIGHT}px)] px-10 flex items-center from-primary via-primary to-fresh-green-dark text-primary-foreground`}
      >
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.id}>
                <div className=" py-12 md:py-20 lg:py-24">
                  <div className="container mx-auto grid lg:grid-cols-2 bg-amber- items-center">
                    {/* Content */}
                    <div className="text-center lg:text-left">
                      {slide.badge && (
                        <span className="inline-block bg-secondary text-secondary-foreground text-sm font-semibold px-4 py-2 rounded-full mb-6 animate-pulse-soft">
                          🎉 {slide.badge}
                        </span>
                      )}
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 whitespace-pre-line">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
                        {slide.subtitle}
                      </p>
                      <Link href={slide.ctaLink}>
                        <Button
                          size="lg"
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-8 h-14 text-lg font-semibold shadow-elevated"
                        >
                          {slide.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Hero image/illustration */}
                    <div className="relative hidden lg:block">
                      <div className="relative z-10 flex justify-center">
                        <div className="text-[200px] animate-float">
                          {slide.emoji}
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute top-10 left-10 text-6xl animate-bounce delay-100">
                        {slide.decorations[0]}
                      </div>
                      <div className="absolute bottom-10 left-20 text-5xl animate-bounce delay-200">
                        {slide.decorations[1]}
                      </div>
                      <div className="absolute top-20 right-10 text-5xl animate-bounce delay-300">
                        {slide.decorations[2]}
                      </div>
                      <div className="absolute bottom-20 right-20 text-6xl animate-bounce delay-150">
                        {slide.decorations[3]}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
