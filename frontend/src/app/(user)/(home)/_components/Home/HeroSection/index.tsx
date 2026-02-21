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
import { getVouchers } from "@/services/voucher";
import {
  FALLBACK_HERO_SLIDES,
  mapPromoCardsToHeroSlides,
  mapVouchersToPromoCards,
  type HeroSlide,
} from "./slides";
import { SlideContent } from "./SlideContent";
import { DotIndicators } from "./DotIndicators";

export function HeroSection() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_HERO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadDealsSlides = async () => {
      try {
        const response = await getVouchers({ isRedeemed: false });
        const promoCards = mapVouchersToPromoCards(response.data);
        const mappedSlides = mapPromoCardsToHeroSlides(promoCards);
        if (isMounted && mappedSlides.length > 0) {
          setSlides(mappedSlides);
        }
      } catch (error) {
        console.error("Failed to load hero promos:", error);
      }
    };

    loadDealsSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const syncCarouselState = () => {
      setTotalSlides(carouselApi.scrollSnapList().length);
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    syncCarouselState();
    carouselApi.on("select", syncCarouselState);
    carouselApi.on("reInit", syncCarouselState);

    return () => {
      carouselApi.off("select", syncCarouselState);
      carouselApi.off("reInit", syncCarouselState);
    };
  }, [carouselApi, slides.length]);

  const goToSlide = useCallback(
    (index: number) => carouselApi?.scrollTo(index),
    [carouselApi]
  );

  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-br from-primary via-primary to-fresh-green-dark text-white h-screen min-h-[600px] max-h-[900px] flex items-center">
        <Carousel
          setApi={setCarouselApi}
          opts={{ align: "start", loop: true }}
          className="w-full relative"
        >
          <CarouselContent>
            {slides.map((slide) => (
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
