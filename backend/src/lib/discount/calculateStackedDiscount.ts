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
  quantityDiscounts?: Array<{
    id: string;
    name: string;
    buyQuantity: number;
    freeQuantity: number;
    endsAt?: Date | null;
  }>;
}

/**
 * Calculates stacked discounts on a price
 * Applies percentage discounts and fixed amount discounts alternately
 * to minimize the final price for the customer
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

  if (applicableDiscounts.length === 0) {
    return {
      discountedPrice: price,
      totalDiscount: 0,
      appliedCount: 0,
      appliedDiscounts: [],
      earliestEndsAt: null,
      quantityDiscounts: quantityDiscounts.length > 0 ? quantityDiscounts : undefined,
    };
  }

  const percentageDiscounts = applicableDiscounts
    .filter((discount) => discount.type === "PERCENTAGE")
    .sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));

  const amountDiscounts = applicableDiscounts
    .filter((discount) => discount.type === "FIXED_AMOUNT")
    .sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0));

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

  // Track applied discounts
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

  // Alternate between percentage and amount discounts
  while (
    percentageDiscounts.length > 0 &&
    amountDiscounts.length > 0 &&
    remainingPrice > 0
  ) {
    const pctDiscount = percentageDiscounts[0];
    const amtDiscount = amountDiscounts[0];

    const pctAmount = remainingPrice * (Number(pctDiscount.percentage ?? 0) / 100);
    const amtAmount = Number(amtDiscount.amount ?? 0);

    if (pctAmount >= amtAmount) {
      const actualDiscount = Math.min(pctAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
        appliedCount += 1;
        trackAppliedDiscount(pctDiscount, actualDiscount);
      }
      percentageDiscounts.shift();
    } else {
      const actualDiscount = Math.min(amtAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
        appliedCount += 1;
        trackAppliedDiscount(amtDiscount, actualDiscount);
      }
      amountDiscounts.shift();
    }
  }

  // Apply remaining percentage discounts
  while (percentageDiscounts.length > 0 && remainingPrice > 0) {
    const pctDiscount = percentageDiscounts.shift();
    if (!pctDiscount) break;
    const pctAmount = remainingPrice * (Number(pctDiscount.percentage ?? 0) / 100);
    const actualDiscount = Math.min(pctAmount, remainingPrice);
    if (actualDiscount > 0) {
      totalDiscount += actualDiscount;
      remainingPrice -= actualDiscount;
      appliedCount += 1;
      trackAppliedDiscount(pctDiscount, actualDiscount);
    }
  }

  // Apply remaining amount discounts
  while (amountDiscounts.length > 0 && remainingPrice > 0) {
    const amtDiscount = amountDiscounts.shift();
    if (!amtDiscount) break;
    const amtAmount = Number(amtDiscount.amount ?? 0);
    const actualDiscount = Math.min(amtAmount, remainingPrice);
    if (actualDiscount > 0) {
      totalDiscount += actualDiscount;
      remainingPrice -= actualDiscount;
      appliedCount += 1;
      trackAppliedDiscount(amtDiscount, actualDiscount);
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
    return {
      discountedPrice: price,
      totalDiscount: 0,
      appliedCount: 0,
      appliedDiscounts: [],
      earliestEndsAt: null,
      quantityDiscounts: quantityDiscounts.length > 0 ? quantityDiscounts : undefined,
    };
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
