import type { Store } from "../../../prisma/generated/client";

export type StoreWithDistance = {
  store: Store;
  distanceKm: number;
};

export type CheckoutItem = {
  productId: string;
  quantity: number;
};

export type ActivePendingOrderSnapshot = {
  id: string;
  userAddressId: string;
  voucherCodes: string[];
  orderItems: CheckoutItem[];
};

export type VoucherReservationCandidate = {
  id: string;
  code: string;
  userId: string | null;
  voucherType: "REFERRAL" | "TRANSACTIONAL" | "FREEDELIVERY";
  discount: {
    isQuantityLimited: boolean;
    maxUses: number | null;
    useCounter: number;
  };
};
