import type { ChangeEvent } from "react";
import type { CreateOrderResponse } from "@/services/order/createOrder";
import type { BankInfo } from "@/services/order/getBankInfo";

export type PricingSummary = {
  originalShippingCost: number;
  shippingDiscount: number;
  finalShippingCost: number;
  hasShippingDiscount: boolean;
  productDiscount: number;
};

export type PaymentPageState = {
  loading: boolean;
  order: CreateOrderResponse | null;
  bankInfo: BankInfo | null;
  isProcessing: boolean;
  remainingSeconds: number | null;
  showReuploadNotice: boolean;
  pricingSummary: PricingSummary;
  isProofUploadExpired: boolean;
  onProofFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadProof: () => Promise<void>;
  onPayWithMidtrans: () => Promise<void>;
  onCancelOrder: () => Promise<void>;
  onBackToOrders: () => void;
};
