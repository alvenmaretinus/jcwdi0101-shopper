"use client";

import { useEffect, useState } from "react";
import { Clock, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVouchers } from "@/services/voucher";
import type { Voucher } from "@/types/Voucher";

interface PromoCard {
  title: string;
  description: string;
  discount: string;
  code: string;
  emoji: string;
  expiresIn: string;
  remainingUses: string;
}

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

function getRemainingUsesLabel(
  isLimited?: boolean,
  limit?: number,
  useCounter?: number
) {
  if (!isLimited) return "Unlimited";
  const totalLimit = typeof limit === "number" ? limit : 0;
  const used = typeof useCounter === "number" ? useCounter : 0;
  return String(Math.max(0, totalLimit - used));
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.round(amount));
}

function buildPromoCards(vouchers: Voucher[]): PromoCard[] {
  return vouchers
    .filter((v) => v.voucherType !== "REFERRAL")
    .map((voucher) => {
      const discount = voucher.discount;
      let discountDisplay = "";
      let description = "";
      let emoji = "🎁";

      if (discount.type === "PERCENTAGE" && discount.percentage) {
        discountDisplay = `${discount.percentage}%`;
        description = `Get ${discount.percentage}% off`;
      } else if (
        discount.type === "QUANTITY" &&
        discount.buyQuantity &&
        discount.freeQuantity
      ) {
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
      } else if (
        discount.name.toLowerCase().includes("produce") ||
        discount.name.toLowerCase().includes("fresh")
      ) {
        emoji = "🥗";
      }

      let expiresIn = "Ongoing";
      if (discount.endsAt) {
        const diffDays = Math.ceil(
          (new Date(discount.endsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );
        expiresIn =
          diffDays > 0 ? `${diffDays} day${diffDays > 1 ? "s" : ""}` : "Expires soon";
      }

      return {
        title: discount.name,
        description,
        discount: discountDisplay,
        code: voucher.code,
        emoji,
        expiresIn,
        remainingUses: getRemainingUsesLabel(
          discount.isLimited,
          discount.limit,
          discount.useCounter
        ),
      };
    });
}

function buildReferralCards(vouchers: Voucher[]): PromoCard[] {
  return vouchers
    .filter((v) => v.voucherType === "REFERRAL")
    .map((voucher) => {
      const discount = voucher.discount;
      const roleLabel =
        voucher.referralRole === "REFERRER" ? "For Referrer" : "For Referred User";
      let discountDisplay = "REF";
      let description = `${roleLabel}: referral reward voucher`;

      if (discount.type === "PERCENTAGE" && discount.percentage) {
        discountDisplay = `${discount.percentage}%`;
        description = `${roleLabel}: ${discount.percentage}% off`;
      } else if (discount.type === "FIXED_AMOUNT" && discount.amount) {
        discountDisplay = formatRupiah(discount.amount);
        description = `${roleLabel}: ${formatRupiah(discount.amount)} off`;
      }

      if (discount.isWithMinimum && discount.minimumPrice) {
        description += ` (min. ${formatRupiah(discount.minimumPrice)})`;
      }

      let expiresIn = "Ongoing";
      if (discount.endsAt) {
        const diffDays = Math.ceil(
          (new Date(discount.endsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );
        expiresIn =
          diffDays > 0 ? `${diffDays} day${diffDays > 1 ? "s" : ""}` : "Expires soon";
      }

      return {
        title: `${discount.name} (${roleLabel})`,
        description,
        discount: discountDisplay,
        code: voucher.code,
        emoji: voucher.referralRole === "REFERRER" ? "🎉" : "🎁",
        expiresIn,
        remainingUses: getRemainingUsesLabel(
          discount.isLimited,
          discount.limit,
          discount.useCounter
        ),
      };
    });
}

function VoucherCard({
  promo,
  gradient,
}: {
  promo: PromoCard;
  gradient: { from: string; to: string };
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl text-white p-6"
      style={{
        background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
      }}
    >
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
        {promo.emoji}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
          <Clock className="h-4 w-4" />
          <span>{promo.expiresIn}</span>
        </div>
        <div className="text-3xl font-bold mb-2">{promo.discount}</div>
        <h3 className="text-lg font-bold mb-2">{promo.title}</h3>
        <p className="text-white/80 text-sm mb-4">{promo.description}</p>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-sm">Code: </span>
          <span className="font-mono font-bold">{promo.code}</span>
        </div>
        <p className="text-xs text-white/80 mt-2">
          Remaining uses: {promo.remainingUses}
        </p>
      </div>
    </div>
  );
}

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
