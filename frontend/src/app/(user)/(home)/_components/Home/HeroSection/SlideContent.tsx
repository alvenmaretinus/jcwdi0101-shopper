import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "./slides";

function SlideBadge({ text }: { text: string }) {
  return (
    <span className="inline-block bg-secondary text-secondary-foreground text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 animate-pulse">
      🎉 {text}
    </span>
  );
}

function SlideTitle({ children }: { children: string }) {
  return (
    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-4 sm:mb-6 whitespace-pre-line">
      {children}
    </h1>
  );
}

function SlideSubtitle({ children }: { children: string }) {
  return (
    <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
      {children}
    </p>
  );
}

function SlideCta({ text, href }: { text: string; href: string }) {
  return (
    <Link href={href}>
      <Button
        size="lg"
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg"
      >
        {text}
        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </Link>
  );
}

function SlideIllustration({ emoji }: { emoji: string }) {
  return (
    <div className="relative hidden lg:block">
      <div className="relative z-10 flex justify-center">
        <div className="text-[150px] xl:text-[200px] animate-bounce">
          {emoji}
        </div>
      </div>
    </div>
  );
}

export function SlideContent({ slide }: { slide: HeroSlide }) {
  return (
    <div className="py-8 sm:py-12 md:py-20 lg:py-24">
      <div className="container mx-auto grid lg:grid-cols-2 items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left">
          {slide.badge && <SlideBadge text={slide.badge} />}
          <SlideTitle>{slide.title}</SlideTitle>
          <SlideSubtitle>{slide.subtitle}</SlideSubtitle>
          <SlideCta text={slide.cta} href={slide.ctaLink} />
        </div>

        {/* Visual */}
        <SlideIllustration emoji={slide.emoji} />
      </div>
    </div>
  );
}
