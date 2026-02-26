import type { CreateChargeResponse } from "@/services/order/createCharge";

export type ApiWrapper<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

type SnapOptions = {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
};

type SnapNamespace = {
  pay: (token: string, options?: SnapOptions) => void;
};

declare global {
  interface Window {
    snap?: SnapNamespace;
  }
}

const MIDTRANS_CACHE_KEY_PREFIX = "midtrans:tx:";

const getMidtransCacheKey = (orderId: string): string =>
  `${MIDTRANS_CACHE_KEY_PREFIX}${orderId}`;

const isMidtransChargeResponse = (
  value: unknown
): value is CreateChargeResponse => {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.orderId === "string" &&
    typeof payload.transactionId === "string" &&
    typeof payload.amount === "number"
  );
};

export const isApiWrapper = <T>(value: unknown): value is ApiWrapper<T> =>
  typeof value === "object" && value !== null && "data" in (value as object);

export const formatRupiah = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export const formatCountdown = (remainingSeconds: number): string =>
  new Date(remainingSeconds * 1000).toISOString().slice(11, 19);

export const extractDiscountAmountByPrefix = (
  discountNames: string[] | undefined,
  prefix: string
): number => {
  if (!discountNames || discountNames.length === 0) {
    return 0;
  }

  for (const discountName of discountNames) {
    if (!discountName.startsWith(prefix)) continue;
    const parsed = Number(discountName.slice(prefix.length));
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed);
    }
  }

  return 0;
};

export const extractShippingDiscount = (discountNames?: string[]): number =>
  extractDiscountAmountByPrefix(discountNames, "SHIPPING_DISCOUNT:");

export const extractQuantityBonusByProductId = (
  discountNames?: string[],
  prefixes: string[] = ["PROMO_QTY_BONUSES:", "VOUCHER_QTY_BONUSES:"],
): Record<string, number> => {
  const result: Record<string, number> = {};
  if (!Array.isArray(discountNames) || discountNames.length === 0) {
    return result;
  }

  for (const discountName of discountNames) {
    const matchedPrefix = prefixes.find((prefix) =>
      discountName.startsWith(prefix),
    );
    if (!matchedPrefix) {
      continue;
    }

    const rawValue = discountName.slice(matchedPrefix.length);
    if (!rawValue) {
      continue;
    }

    for (const entry of rawValue.split("|")) {
      const [productIdRaw, freeQtyRaw] = entry.split(":");
      const productId = (productIdRaw ?? "").trim();
      const freeQty = Math.max(0, Number(freeQtyRaw) || 0);
      if (!productId || freeQty <= 0) {
        continue;
      }

      result[productId] = (result[productId] ?? 0) + freeQty;
    }
  }

  return result;
};

export const parseErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallbackMessage;
};

export const readCachedMidtransTx = (
  orderId: string
): CreateChargeResponse | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getMidtransCacheKey(orderId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isMidtransChargeResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveCachedMidtransTx = (
  orderId: string,
  transaction: CreateChargeResponse
): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getMidtransCacheKey(orderId),
      JSON.stringify(transaction)
    );
  } catch {
    // ignore storage failure
  }
};

export const clearCachedMidtransTx = (orderId: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getMidtransCacheKey(orderId));
  } catch {
    // ignore storage failure
  }
};
