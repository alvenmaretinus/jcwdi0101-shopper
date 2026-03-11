"use client";

import { Tag } from "lucide-react";
import { DealsCarouselSection } from "@/components/sections/DealsCarouselSection";
import { groupProductDiscounts } from "@/lib/groupProductDiscounts";
import { transformFlashDealCards, transformBogoDealCards } from "@/lib/transformDealCards";
import { useUserDealsStore } from "@/store/user/useUserDealsStore";

export function DealsSection() {
  const flashDeals = useUserDealsStore((state) => state.flashDeals);
  const bogoProducts = useUserDealsStore((state) => state.bogoProducts);
  const dealsMeta = useUserDealsStore((state) => state.dealsMeta);
  const dealsLoading = useUserDealsStore((state) => state.dealsLoading);
  const fetchDeals = useUserDealsStore((state) => state.fetchDeals);
  // Transform flash deals with discounts - backend filters out-of-stock products
  const flashDealGroups = groupProductDiscounts(flashDeals);
  const flashDealCards = transformFlashDealCards(flashDealGroups);

  // Transform BOGO deals - each product can have multiple BXGY offers
  const bogoDealGroups = groupProductDiscounts(bogoProducts);
  const bogoDealCards = transformBogoDealCards(bogoDealGroups);

  const combinedDeals = [...flashDealCards, ...bogoDealCards];

  return (
    <DealsCarouselSection
      title="Today's Deals"
      icon={<Tag className="h-6 w-6 text-primary" />}
      deals={combinedDeals}
      currentPage={dealsMeta.page}
      totalPages={dealsMeta.totalPages}
      onPageChange={fetchDeals}
      loading={dealsLoading}
    />
  );
}
