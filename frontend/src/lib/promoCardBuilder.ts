import { Discount } from "@/types/Discount";
import { Voucher } from "@/types/Voucher";

export interface PromoCard {
  title: string;
  description: string;
  discount: string;
  code?: string;
  emoji: string;
  expiresIn: string;
  remainingUses: string;
  id?: string;
}

export function getRemainingUsesLabel(
  isQuantityLimited?: boolean,
  maxUses?: number,
  useCounter?: number
): string {
  if (!isQuantityLimited) return "Unlimited";
  const totalLimit = typeof maxUses === "number" ? maxUses : 0;
  const used = typeof useCounter === "number" ? useCounter : 0;
  return String(Math.max(0, totalLimit - used));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function getExpiresInLabel(endsAt?: string | Date | null): string {
  if (!endsAt) return "Ongoing";
  const endDate = new Date(endsAt);
  if (Number.isNaN(endDate.getTime())) return "Ongoing";
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }
  return "Expires soon";
}

export function getEmojiForVoucher(
  voucher: Voucher | { voucherType?: string; discount: { name?: string | null } }
): string {
  if (voucher.voucherType === "FREEDELIVERY") {
    return "🚚";
  }
  
  const name = voucher.discount.name?.toLowerCase() || "";
  
  if (name.includes("dairy")) {
    return "🧀";
  } else if (name.includes("produce") || name.includes("fresh")) {
    return "🥗";
  }
  
  return "🎁";
}

export function getEmojiForDiscount(discount: Discount): string {
  if (discount.type === "QUANTITY") {
    return "🎁";
  }
  if (discount.type === "FIXED_AMOUNT") {
    return "💸";
  }
  return "🏷️";
}

/**
 * Builds promo cards from vouchers (for display in UI)
 * Filters out referral vouchers
 */
export function buildPromoCards(vouchers: Voucher[]): PromoCard[] {
  return vouchers
    .filter((voucher) => voucher.voucherType !== "REFERRAL")
    .map((voucher) => {
      const discount = voucher.discount;
      let discountDisplay = "";
      let description = "";

      if (discount.type === "PERCENTAGE" && discount.percentage) {
        discountDisplay = `${discount.percentage}%`;
        description = `Get ${discount.percentage}% off`;
        if (discount.isWithMinimum) {
          description += ` (min. ${formatRupiah(discount.minimumPrice || 0)})`;
        }
      } else if (
        discount.type === "QUANTITY" &&
        discount.buyQuantity &&
        discount.freeQuantity
      ) {
        discountDisplay = `B${discount.buyQuantity}G${discount.freeQuantity}`;
        description = `Buy ${discount.buyQuantity}, get ${discount.freeQuantity} free`;
        if (discount.isWithMinimum) {
          description += ` (min. ${formatRupiah(discount.minimumPrice || 0)})`;
        }
      } else if (discount.type === "FIXED_AMOUNT") {
        const amount = discount.amount ?? 0;
        discountDisplay = amount === 0 ? "FREE" : formatRupiah(amount);

        if (voucher.voucherType === "FREEDELIVERY") {
          description =
            amount > 0
              ? `Free delivery up to ${formatRupiah(amount)}`
              : "Free delivery";
          if (discount.isWithMinimum) {
            description += ` (min. ${formatRupiah(discount.minimumPrice || 0)})`;
          }
        } else {
          description = amount === 0 ? "Free delivery" : `Get ${formatRupiah(amount)} off`;
          if (discount.isWithMinimum) {
            description += ` (min. ${formatRupiah(discount.minimumPrice || 0)})`;
          }
        }
      }

      const emoji = getEmojiForVoucher(voucher);
      const expiresIn = getExpiresInLabel(discount.endsAt);

      return {
        id: voucher.id,
        title: discount.name || "Discount",
        description,
        discount: discountDisplay,
        code: voucher.code,
        emoji,
        expiresIn,
        remainingUses: getRemainingUsesLabel(
          discount.isQuantityLimited,
          discount.maxUses,
          discount.useCounter
        ),
      };
    });
}

/**
 * Builds referral promo cards from vouchers (for display in UI)
 * Filters only referral vouchers
 */
export function buildReferralCards(vouchers: Voucher[]): PromoCard[] {
  return vouchers
    .filter((voucher) => voucher.voucherType === "REFERRAL")
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

      const expiresIn = getExpiresInLabel(discount.endsAt);

      return {
        id: voucher.id,
        title: `${discount.name || "Discount"} (${roleLabel})`,
        description,
        discount: discountDisplay,
        code: voucher.code,
        emoji: voucher.referralRole === "REFERRER" ? "🎉" : "🎁",
        expiresIn,
        remainingUses: getRemainingUsesLabel(
          discount.isQuantityLimited,
          discount.maxUses,
          discount.useCounter
        ),
      };
    });
}

/**
 * Builds promo cards from non-voucher storewide discounts (for display in UI)
 */
export function buildStorewideDiscountCards(discounts: Discount[]): PromoCard[] {
  return discounts.map((discount) => {
    let discountDisplay = "";
    let description = "";

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
      const amount = discount.amount ?? 0;
      discountDisplay = amount === 0 ? "FREE" : formatRupiah(amount);
      description = amount === 0 ? "Free delivery" : `Get ${formatRupiah(amount)} off`;
    }

    if (discount.isWithMinimum && discount.minimumPrice) {
      description += ` (min. ${formatRupiah(discount.minimumPrice)})`;
    }

    return {
      id: discount.id,
      title: discount.name || "Storewide Discount",
      description,
      discount: discountDisplay,
      emoji: getEmojiForDiscount(discount),
      expiresIn: getExpiresInLabel(discount.endsAt),
      remainingUses: getRemainingUsesLabel(
        discount.isQuantityLimited,
        discount.maxUses,
        discount.useCounter
      ),
    };
  });
}
