"use client";

import { Percent } from "lucide-react";
import { CardCarouselSection } from "@/components/sections/CardCarouselSection";
import { buildStorewideDiscountCards } from "@/lib/promoCardBuilder";
import { renderVoucherCard } from "@/lib/renderVoucherCard";
import { gradientsBlue } from "@/constants/gradients";
import { useUserDealsStore } from "@/store/user/useUserDealsStore";

export function StorewideDiscountsSection() {
  const storeWideDiscounts = useUserDealsStore((state) => state.storeWideDiscounts);
  const storewideDiscountsMeta = useUserDealsStore((state) => state.storewideDiscountsMeta);
  const storewideLoading = useUserDealsStore((state) => state.storewideLoading);
  const fetchStorewideDiscounts = useUserDealsStore((state) => state.fetchStorewideDiscounts);

  const storewideCards = buildStorewideDiscountCards(storeWideDiscounts);

  return (
    <CardCarouselSection
      title="Storewide Discounts"
      icon={<Percent className="h-6 w-6 text-primary" />}
      items={storewideCards}
      gradients={gradientsBlue}
      renderCard={renderVoucherCard}
      currentPage={storewideDiscountsMeta.page}
      totalPages={storewideDiscountsMeta.totalPages}
      onPageChange={fetchStorewideDiscounts}
      loading={storewideLoading}
    />
  );
}
