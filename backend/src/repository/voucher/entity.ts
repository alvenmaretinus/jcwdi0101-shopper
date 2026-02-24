import Decimal from "decimal.js";

export type VoucherCreateReq = {
  code: string;
  userId?: string;
  referralRole?: "REFERRER" | "REFEREE";
  name: string;
  percentage?: Decimal;
  amount?: number;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "QUANTITY";
  voucherType: "REFERRAL" | "TRANSACTIONAL" | "FREEDELIVERY";
  isWithMinimum: boolean;
  minimumPrice?: number;
  isQuantityLimited?: boolean;
  maxUses?: number;
  buyQuantity?: number;
  freeQuantity?: number;
  startsAt?: Date;
  endsAt?: Date;
};

/**
 * A voucher is considered redeemed when its associated discount has reached its usage limit.
 * The discount's useCounter and limit fields determine redemption status.
 */

export type VoucherUpdateReq = {
  code?: string;
  userId?: string;
  referralRole?: "REFERRER" | "REFEREE";
  name?: string;
  percentage?: Decimal;
  amount?: number;
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | "QUANTITY";
  voucherType?: "REFERRAL" | "TRANSACTIONAL" | "FREEDELIVERY";
  isWithMinimum?: boolean;
  minimumPrice?: number;
  isQuantityLimited?: boolean;
  maxUses?: number;
  buyQuantity?: number;
  freeQuantity?: number;
  startsAt?: Date;
  endsAt?: Date;
};

export type VoucherFilter = {
  code?: string;
  userId?: string;
  referralRole?: "REFERRER" | "REFEREE";
  name?: string;
  percentage?: Decimal;
  amount?: number;
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | "QUANTITY";
  voucherType?: "REFERRAL" | "TRANSACTIONAL" | "FREEDELIVERY";
  isWithMinimum?: boolean;
  minimumPrice?: number;
  buyQuantity?: number;
  freeQuantity?: number;
  activeOnDate?: Date;
};

export type VoucherResponse = {
  id: string;
  code: string;
  discountId: string;
  userId: string | null;
  voucherType: "REFERRAL" | "TRANSACTIONAL" | "FREEDELIVERY";
  referralRole: "REFERRER" | "REFEREE" | null;
  isSoftDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  discount: {
    id: string;
    name: string | null;
    percentage: Decimal | null;
    amount: number | null;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "QUANTITY";
    isVoucher: boolean;
    isWithMinimum: boolean;
    minimumPrice: number | null;
    hasDiscountAmountCap: boolean;
    maxDiscountAmount: number | null;
    isQuantityLimited: boolean;
    maxUses: number | null;
    useCounter: number;
    isTiedToProduct: boolean;
    productId: string | null;
    buyQuantity: number | null;
    freeQuantity: number | null;
    startsAt: Date | null;
    endsAt: Date | null;
    isSoftDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
};
