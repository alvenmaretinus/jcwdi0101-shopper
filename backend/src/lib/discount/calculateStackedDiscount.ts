import { DiscountResponse } from "../../repository/discount/entity";

export interface CalculatedDiscount {
  id: string;
  name: string;
  label: string;
  savedAmount: number;
  endsAt?: Date | null;
}

export interface StackedDiscountResult {
  discountedPrice: number;
  totalDiscount: number;
  appliedCount: number;
  appliedDiscounts: CalculatedDiscount[];
  earliestEndsAt?: Date | null;
  unmetMinimumDiscounts?: Array<{
    id: string;
    name: string;
    label: string;
    minimumPrice: number;
  }>;
  quantityDiscounts?: Array<{
    id: string;
    name: string;
    buyQuantity: number;
    freeQuantity: number;
    endsAt?: Date | null;
  }>;
}

/**
 * Calculates stacked discounts on a price.
 *
 * Discounts are split into three buckets:
 *   1. Pure percentage discounts (sorted by percentage desc)
 *   2. Fixed-amount discounts (sorted by amount desc)
 *   3. Percentage-with-limit discounts (effective amount recalculated each iteration)
 *
 * Each iteration picks the single best discount across all three buckets,
 * applies it, and repeats until no discounts remain or price reaches 0.
 */
export function calculateStackedDiscount(
  price: number,
  discounts: DiscountResponse[]
): StackedDiscountResult {
  // Extract QUANTITY discounts separately (BOGO offers)
  const quantityDiscounts = discounts
    .filter((discount) => discount.type === "QUANTITY" && discount.buyQuantity && discount.freeQuantity)
    .map((discount) => ({
      id: discount.id,
      name: discount.name || "Buy X Get Y",
      buyQuantity: discount.buyQuantity!,
      freeQuantity: discount.freeQuantity!,
      endsAt: discount.endsAt || null,
    }));

  // Filter only applicable price discounts (PERCENTAGE and FIXED_AMOUNT)
  const applicableDiscounts = discounts.filter((discount) => {
    if (discount.type !== "PERCENTAGE" && discount.type !== "FIXED_AMOUNT") {
      return false;
    }
    if (discount.isWithMinimum && discount.minimumPrice && price < discount.minimumPrice) {
      return false;
    }
    return true;
  });

  const emptyResult: StackedDiscountResult = {
    discountedPrice: price,
    totalDiscount: 0,
    appliedCount: 0,
    appliedDiscounts: [],
    earliestEndsAt: null,
    quantityDiscounts: quantityDiscounts.length > 0 ? quantityDiscounts : undefined,
  };

  if (applicableDiscounts.length === 0) {
    return emptyResult;
  }

  // ── Bucket 1: Pure percentage discounts (no limit cap), sorted by pct desc ──
  const purePercentageDiscounts = applicableDiscounts
    .filter((d) => d.type === "PERCENTAGE" && !d.hasDiscountAmountCap)
    .sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));

  // ── Bucket 2: Fixed-amount discounts, sorted by amount desc ──
  const fixedAmountDiscounts = applicableDiscounts
    .filter((d) => d.type === "FIXED_AMOUNT")
    .sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0));

  // ── Bucket 3: Percentage-with-limit discounts (effective amt changes each iter) ──
  const limitedPercentageDiscounts = applicableDiscounts
    .filter((d) => d.type === "PERCENTAGE" && d.hasDiscountAmountCap && d.maxDiscountAmount);

  let totalDiscount = 0;
  let remainingPrice = price;
  let appliedCount = 0;
  const appliedDiscounts: CalculatedDiscount[] = [];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const trackAppliedDiscount = (
    discount: DiscountResponse,
    actualDiscount: number
  ) => {
    if (actualDiscount <= 0) return;
    const label =
      discount.type === "PERCENTAGE"
        ? `${Number(discount.percentage ?? 0)}%`
        : formatPrice(Number(discount.amount ?? 0));

    appliedDiscounts.push({
      id: discount.id,
      name: discount.name || "Discount",
      label,
      savedAmount: Math.round(actualDiscount),
      endsAt: discount.endsAt || null,
    });
  };

  // ── Main loop: pick best discount from any bucket each iteration ──
  while (remainingPrice > 0) {
    // Candidate from bucket 1 – best pure percentage
    let bestPurePctAmount = 0;
    if (purePercentageDiscounts.length > 0) {
      bestPurePctAmount = remainingPrice * (Number(purePercentageDiscounts[0].percentage ?? 0) / 100);
    }

    // Candidate from bucket 2 – best fixed amount
    let bestFixedAmount = 0;
    if (fixedAmountDiscounts.length > 0) {
      bestFixedAmount = Number(fixedAmountDiscounts[0].amount ?? 0);
    }

    // Candidate from bucket 3 – recalculate effective amounts, sort, pick best
    let bestLimitedAmount = 0;
    let bestLimitedIndex = -1;
    if (limitedPercentageDiscounts.length > 0) {
      // Calculate effective discount for each limited-percentage discount
      const effectiveAmounts = limitedPercentageDiscounts.map((d) => {
        const rawPct = remainingPrice * (Number(d.percentage ?? 0) / 100);
        return Math.min(rawPct, d.maxDiscountAmount!);
      });

      // Find the one with the highest effective amount
      for (let i = 0; i < effectiveAmounts.length; i++) {
        if (effectiveAmounts[i] > bestLimitedAmount) {
          bestLimitedAmount = effectiveAmounts[i];
          bestLimitedIndex = i;
        }
      }
    }

    // No more discounts to apply
    if (bestPurePctAmount <= 0 && bestFixedAmount <= 0 && bestLimitedAmount <= 0) {
      break;
    }

    // Pick the best across all three buckets
    if (bestPurePctAmount >= bestFixedAmount && bestPurePctAmount >= bestLimitedAmount) {
      // Apply pure percentage discount
      const discount = purePercentageDiscounts.shift()!;
      const actualDiscount = Math.min(bestPurePctAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
        appliedCount += 1;
        trackAppliedDiscount(discount, actualDiscount);
      }
    } else if (bestFixedAmount >= bestPurePctAmount && bestFixedAmount >= bestLimitedAmount) {
      // Apply fixed amount discount
      const discount = fixedAmountDiscounts.shift()!;
      const actualDiscount = Math.min(bestFixedAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
        appliedCount += 1;
        trackAppliedDiscount(discount, actualDiscount);
      }
    } else {
      // Apply limited percentage discount
      const discount = limitedPercentageDiscounts.splice(bestLimitedIndex, 1)[0];
      const actualDiscount = Math.min(bestLimitedAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
        appliedCount += 1;
        trackAppliedDiscount(discount, actualDiscount);
      }
    }
  }

  const discountedPrice = Math.max(0, Math.round(price - totalDiscount));

  // Find earliest end date
  const endDates = appliedDiscounts
    .map((d) => d.endsAt)
    .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  const earliestEndsAt = endDates.length > 0 ? endDates[0] : null;

  if (discountedPrice >= price || appliedCount === 0) {
    return emptyResult;
  }

  return {
    discountedPrice,
    totalDiscount: Math.round(totalDiscount),
    appliedCount,
    appliedDiscounts,
    earliestEndsAt,
    quantityDiscounts: quantityDiscounts.length > 0 ? quantityDiscounts : undefined,
  };
}
