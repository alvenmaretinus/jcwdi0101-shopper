"use client";

import { Users } from "lucide-react";
import { CardCarouselSection } from "@/components/sections/CardCarouselSection";
import { buildReferralCards } from "@/lib/promoCardBuilder";
import { renderVoucherCard } from "@/lib/renderVoucherCard";
import { gradientsPink } from "@/constants/gradients";
import { useUserDealsStore } from "@/store/user/useUserDealsStore";

export function ReferralVouchersSection() {
  const referralVouchers = useUserDealsStore((state) => state.referralVouchers);
  const referralMeta = useUserDealsStore((state) => state.referralMeta);
  const referralLoading = useUserDealsStore((state) => state.referralLoading);
  const fetchReferralVouchers = useUserDealsStore((state) => state.fetchReferralVouchers);

  const referralCards = buildReferralCards(referralVouchers);

  return (
    <CardCarouselSection
      title="Referral Vouchers"
      icon={<Users className="h-6 w-6 text-primary" />}
      items={referralCards}
      gradients={gradientsPink}
      renderCard={renderVoucherCard}
      currentPage={referralMeta.page}
      totalPages={referralMeta.totalPages}
      onPageChange={fetchReferralVouchers}
      loading={referralLoading}
    />
  );
}
