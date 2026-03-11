import type { Discount } from "@/types/Discount";
import type { Voucher } from "@/types/Voucher";

export type DiscountType = Discount["type"];
export type VoucherType = Voucher["voucherType"];
export type DiscountTypeFilter = "all" | DiscountType;
export type VoucherTypeFilter = "all" | VoucherType;

export const DEFAULT_DISCOUNT_TYPE: DiscountType = "PERCENTAGE";
export const DEFAULT_VOUCHER_DISCOUNT_TYPE: DiscountType = "PERCENTAGE";
export const DEFAULT_VOUCHER_TYPE: VoucherType = "TRANSACTIONAL";

export const discountTypeOptions: Array<{ value: DiscountType; label: string }> = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED_AMOUNT", label: "Fixed Amount" },
  { value: "QUANTITY", label: "Buy X Get Y" },
];

export const discountTypeFilterOptions: Array<{
  value: DiscountTypeFilter;
  label: string;
}> = [{ value: "all", label: "All Types" }, ...discountTypeOptions];

export const voucherTypeOptions: Array<{ value: VoucherType; label: string }> = [
  { value: "REFERRAL", label: "Referral" },
  { value: "TRANSACTIONAL", label: "Transactional" },
  { value: "FREEDELIVERY", label: "Free Delivery" },
];

export const voucherTypeFilterOptions: Array<{
  value: VoucherTypeFilter;
  label: string;
}> = [{ value: "all", label: "All Types" }, ...voucherTypeOptions];
