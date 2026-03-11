"use client";

import { Gift } from "lucide-react";
import { CardCarouselSection } from "@/components/sections/CardCarouselSection";
import { buildPromoCards } from "@/lib/promoCardBuilder";
import { renderVoucherCard } from "@/lib/renderVoucherCard";
import { gradientsPink } from "@/constants/gradients";
import { useUserDealsStore } from "@/store/user/useUserDealsStore";

export function PromoCardsSection() {
  const promoVouchers = useUserDealsStore((state) => state.promoVouchers);
  const promoMeta = useUserDealsStore((state) => state.promoMeta);
  const promoLoading = useUserDealsStore((state) => state.promoLoading);
  const fetchPromos = useUserDealsStore((state) => state.fetchPromos);

  const promoCards = buildPromoCards(promoVouchers);

  return (
    <CardCarouselSection
      title="Promo Codes"
      icon={<Gift className="h-6 w-6 text-primary" />}
      items={promoCards}
      gradients={gradientsPink}
      renderCard={renderVoucherCard}
      currentPage={promoMeta.page}
      totalPages={promoMeta.totalPages}
      onPageChange={fetchPromos}
      loading={promoLoading}
    />
  );
}
