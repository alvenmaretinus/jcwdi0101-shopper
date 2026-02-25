import type { Voucher } from "@/types/Voucher";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  badge: string;
  emoji: string;
}

export const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    title: "Belanja Apa Saja\nDalam Satu Tempat",
    subtitle: "Temukan kebutuhan harian, produk favorit, dan barang trending dengan mudah.",
    cta: "Mulai Belanja",
    ctaLink: "/products",
    badge: "Pilihan Lengkap untuk Semua Kebutuhan",
    emoji: "🛍️",
  },
  {
    id: "fallback-2",
    title: "Produk Trending\nUpdate Setiap Hari",
    subtitle: "Temukan rekomendasi produk populer yang lagi banyak dicari pelanggan lain.",
    cta: "Lihat Produk",
    ctaLink: "/products",
    badge: "Koleksi Baru Hadir Rutin",
    emoji: "🔥",
  },
  {
    id: "fallback-3",
    title: "Kategori Lengkap\nMudah Dicari",
    subtitle: "Dari kebutuhan rumah, fashion, gadget, sampai hobi, semua ada di sini.",
    cta: "Jelajahi Kategori",
    ctaLink: "/categories",
    badge: "Navigasi Cepat dan Praktis",
    emoji: "📦",
  },
  {
    id: "fallback-4",
    title: "Belanja Nyaman\nKapan Saja",
    subtitle: "Nikmati pengalaman belanja online yang simpel, cepat, dan aman dari mana saja.",
    cta: "Belanja Sekarang",
    ctaLink: "/products",
    badge: "Checkout Mudah dan Aman",
    emoji: "⚡",
  },
];

interface PromoCard {
  title: string;
  description: string;
  discount: string;
  code: string;
  emoji: string;
  expiresIn: string;
  remainingUses: string;
}

const getRemainingUsesLabel = (isQuantityLimited?: boolean, maxUses?: number, useCounter?: number) => {
  if (!isQuantityLimited) return "Unlimited";
  const totalLimit = typeof maxUses === "number" ? maxUses : 0;
  const used = typeof useCounter === "number" ? useCounter : 0;
  return String(Math.max(0, totalLimit - used));
};

const getExpiresInLabel = (endsAt?: Date | string) => {
  if (!endsAt) return "Ongoing";

  const now = new Date();
  const endDate = new Date(endsAt);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }
  return "Expires soon";
};

export const mapVouchersToPromoCards = (vouchers: Voucher[]): PromoCard[] => {
  return vouchers
    .filter((voucher) => voucher.voucherType !== "REFERRAL")
    .map((voucher) => {
      const discount = voucher.discount;
      let discountDisplay = "";
      let description = "";
      let emoji = "🎁";

      if (discount.type === "PERCENTAGE" && discount.percentage) {
        discountDisplay = `${discount.percentage}%`;
        description = `Get ${discount.percentage}% off`;
      } else if (discount.type === "QUANTITY" && discount.buyQuantity && discount.freeQuantity) {
        discountDisplay = `B${discount.buyQuantity}G${discount.freeQuantity}`;
        description = `Buy ${discount.buyQuantity}, get ${discount.freeQuantity} free`;
      } else if (discount.type === "FIXED_AMOUNT") {
        discountDisplay = "FREE";
        description = discount.isWithMinimum
          ? `Free delivery on orders above Rp ${discount.minimumPrice?.toLocaleString()}`
          : "Free delivery";
      }

      if (voucher.voucherType === "FREEDELIVERY") {
        emoji = "🚚";
      } else if (discount.name.toLowerCase().includes("dairy")) {
        emoji = "🧀";
      } else if (discount.name.toLowerCase().includes("produce") || discount.name.toLowerCase().includes("fresh")) {
        emoji = "🥗";
      }

      return {
        title: discount.name,
        description,
        discount: discountDisplay,
        code: voucher.code,
        emoji,
        expiresIn: getExpiresInLabel(discount.endsAt),
        remainingUses: getRemainingUsesLabel(discount.isQuantityLimited, discount.maxUses, discount.useCounter),
      };
    });
};

export const mapPromoCardsToHeroSlides = (promoCards: PromoCard[]): HeroSlide[] => {
  return promoCards.slice(0, 4).map((promo, index) => {
    const hasDiscountValue = promo.discount.trim().length > 0;
    return {
      id: `promo-${promo.code}-${index}`,
      title: hasDiscountValue ? `${promo.title}\n${promo.discount}` : promo.title,
      subtitle: `${promo.description} Use code ${promo.code}.`,
      cta: "View Deals",
      ctaLink: "/deals",
      badge: `${promo.expiresIn} • Remaining uses: ${promo.remainingUses}`,
      emoji: promo.emoji,
    };
  });
};
