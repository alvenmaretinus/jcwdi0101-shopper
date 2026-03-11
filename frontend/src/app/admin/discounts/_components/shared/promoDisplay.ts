import { Gift, Percent, Tag, Ticket, Truck, Users } from "lucide-react";
import type { Discount } from "@/types/Discount";

export const discountTypeIcons = {
  PERCENTAGE: Percent,
  FIXED_AMOUNT: Tag,
  QUANTITY: Gift,
};

export const discountTypeLabels = {
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "Fixed Amount",
  QUANTITY: "Buy X Get Y",
};

export const voucherTypeIcons = {
  REFERRAL: Users,
  TRANSACTIONAL: Ticket,
  FREEDELIVERY: Truck,
};

export const voucherTypeLabels = {
  REFERRAL: "Referral",
  TRANSACTIONAL: "Transactional",
  FREEDELIVERY: "Free Delivery",
};

export function getDiscountValue(discount: Discount) {
  switch (discount.type) {
    case "PERCENTAGE":
      return `${discount.percentage}%`;
    case "FIXED_AMOUNT":
      return `Rp ${discount.amount?.toLocaleString("id-ID")}`;
    case "QUANTITY":
      return `Buy ${discount.buyQuantity} Get ${discount.freeQuantity}`;
    default:
      return "-";
  }
}

export function getRemainingUsesLabel(discount: Discount) {
  if (!discount.isQuantityLimited) return "Unlimited";

  const totalLimit = typeof discount.maxUses === "number" ? discount.maxUses : 0;
  const used = typeof discount.useCounter === "number" ? discount.useCounter : 0;

  return String(Math.max(0, totalLimit - used));
}
