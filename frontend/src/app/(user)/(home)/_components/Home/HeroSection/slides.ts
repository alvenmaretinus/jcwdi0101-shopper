export const HERO_SLIDES = [
  {
    id: 1,
    title: "Fresh Groceries\nDelivered to Your Door",
    subtitle: "Get farm-fresh produce and daily essentials from your nearest store",
    cta: "Shop Now",
    ctaLink: "/products",
    badge: "Free Delivery on Orders Above Rp 200k",
    emoji: "🥗",
  },
  {
    id: 2,
    title: "Weekly Deals\nUp to 50% Off",
    subtitle: "Don't miss out on incredible savings on your favorite products",
    cta: "View Deals",
    ctaLink: "/deals",
    badge: "Limited Time Offer",
    emoji: "🛒",
  },
  {
    id: 3,
    title: "Buy 1 Get 1 Free\nOn Selected Items",
    subtitle: "Stock up on essentials with our exclusive BOGO promotions",
    cta: "Shop BOGO",
    ctaLink: "/deals",
    badge: "Special Promo",
    emoji: "🎁",
  },
  {
    id: 4,
    title: "Fresh From\nLocal Farms",
    subtitle: "Supporting local farmers with organic and sustainably grown produce",
    cta: "Explore Organic",
    ctaLink: "/categories",
    badge: "100% Organic",
    emoji: "🌾",
  },
] as const;

export type HeroSlide = (typeof HERO_SLIDES)[number];
