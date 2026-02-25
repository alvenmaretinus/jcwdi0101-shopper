import { Discount } from "./Discount";

export type VoucherType = "REFERRAL" | "TRANSACTIONAL" | "FREEDELIVERY";

export interface Voucher {
  id: string;
  code: string;
  discountId: string;
  voucherType: VoucherType;
  isRedeemed?: boolean;
  referralRole?: "REFERRER" | "REFEREE" | null;
  isSoftDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  discount: Discount;
}
