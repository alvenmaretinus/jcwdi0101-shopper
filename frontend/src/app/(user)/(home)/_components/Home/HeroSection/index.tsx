"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { HERO_SLIDES } from "./slides";
import { SlideContent } from "./SlideContent";
import { DotIndicators } from "./DotIndicators";

export function HeroSection() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    setTotalSlides(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const goToSlide = useCallback(
    (index: number) => carouselApi?.scrollTo(index),
    [carouselApi]
  );

  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-br min-h-[500px] h-auto sm:h-[calc(100vh-84px)] px-4 sm:px-6 lg:px-10 py-12 sm:py-0 flex items-center from-primary via-primary to-fresh-green-dark text-primary-foreground">
        <Carousel
          setApi={setCarouselApi}
          opts={{ align: "start", loop: true }}
          className="w-full relative"
        >
          <CarouselContent>
            {HERO_SLIDES.map((slide) => (
              <CarouselItem key={slide.id}>
                <SlideContent slide={slide} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden md:flex left-4 lg:left-8 bg-white/20 border-0 text-white hover:bg-white/30 hover:text-white" />
          <CarouselNext className="hidden md:flex right-4 lg:right-8 bg-white/20 border-0 text-white hover:bg-white/30 hover:text-white" />

          <DotIndicators
            total={totalSlides}
            current={currentSlide}
            onSelect={goToSlide}
          />
        </Carousel>
      </div>
    </section>
  );
}
