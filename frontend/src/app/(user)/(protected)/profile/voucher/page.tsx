"use client";

import { useEffect, useState } from "react";
import { Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVouchers } from "@/services/voucher";
import { VoucherCard } from "@/components/cards/VoucherCard";
import { buildPromoCards, buildReferralCards, type PromoCard } from "@/lib/promoCardBuilder";
import type { Voucher } from "@/types/Voucher";

const PROMO_PER_PAGE = 3;
const REFERRAL_PER_PAGE = 3;

const gradientsPink = [
  { from: "#ec4899", to: "#e11d48" },
  { from: "#a855f7", to: "#7c3aed" },
  { from: "#3b82f6", to: "#06b6d4" },
  { from: "#22c55e", to: "#10b981" },
  { from: "#eab308", to: "#f97316" },
  { from: "#ef4444", to: "#ec4899" },
  { from: "#6366f1", to: "#a855f7" },
  { from: "#14b8a6", to: "#22c55e" },
  { from: "#f97316", to: "#f59e0b" },
  { from: "#d946ef", to: "#ec4899" },
];

const gradientsBlue = [
  { from: "#4f46e5", to: "#7c3aed" },
  { from: "#0891b2", to: "#2563eb" },
  { from: "#0d9488", to: "#14b8a6" },
  { from: "#9333ea", to: "#ec4899" },
  { from: "#0ea5e9", to: "#6366f1" },
  { from: "#0f766e", to: "#0ea5e9" },
];

export default function ProfileVoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoPage, setPromoPage] = useState(1);
  const [referralPage, setReferralPage] = useState(1);

  useEffect(() => {
    getVouchers({ isRedeemed: false })
      .then((res) => setVouchers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const promoCards = buildPromoCards(vouchers);
  const referralCards = buildReferralCards(vouchers);

  const totalPromoPages = Math.ceil(promoCards.length / PROMO_PER_PAGE);
  const paginatedPromos = promoCards.slice(
    (promoPage - 1) * PROMO_PER_PAGE,
    promoPage * PROMO_PER_PAGE
  );

  const totalReferralPages = Math.ceil(referralCards.length / REFERRAL_PER_PAGE);
  const paginatedReferrals = referralCards.slice(
    (referralPage - 1) * REFERRAL_PER_PAGE,
    referralPage * REFERRAL_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <Gift className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">No vouchers yet</p>
        <p className="text-sm">Check back later for new offers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">My Vouchers</h1>

      {/* Promo Codes */}
      {promoCards.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Promo Codes
            </h2>
            {totalPromoPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPromoPage((p) => Math.max(1, p - 1))}
                  disabled={promoPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {promoPage} / {totalPromoPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPromoPage((p) => Math.min(totalPromoPages, p + 1))}
                  disabled={promoPage === totalPromoPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedPromos.map((promo, i) => (
              <VoucherCard
                key={promo.code}
                promo={promo}
                gradient={
                  gradientsPink[
                    ((promoPage - 1) * PROMO_PER_PAGE + i) % gradientsPink.length
                  ]
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Referral Vouchers */}
      {referralCards.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>🤝</span>
              Referral Vouchers
            </h2>
            {totalReferralPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReferralPage((p) => Math.max(1, p - 1))}
                  disabled={referralPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {referralPage} / {totalReferralPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setReferralPage((p) => Math.min(totalReferralPages, p + 1))
                  }
                  disabled={referralPage === totalReferralPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedReferrals.map((promo, i) => (
              <VoucherCard
                key={`${promo.code}-${i}`}
                promo={promo}
                gradient={
                  gradientsBlue[
                    ((referralPage - 1) * REFERRAL_PER_PAGE + i) % gradientsBlue.length
                  ]
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
