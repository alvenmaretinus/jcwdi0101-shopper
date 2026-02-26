"use client";

import type { CreateOrderResponse } from "@/services/order/createOrder";
import type { BankInfo } from "@/services/order/getBankInfo";
import type { ChangeEvent } from "react";
import {
  extractQuantityBonusByProductId,
  formatRupiah,
} from "../_lib/payment-utils";
import { BankTransferSection } from "./BankTransferSection";
import { MidtransSection } from "./MidtransSection";

type PricingSummary = {
  originalShippingCost: number;
  finalShippingCost: number;
  hasShippingDiscount: boolean;
  productDiscount: number;
};

type OrderSummaryCardProps = {
  order: CreateOrderResponse;
  bankInfo: BankInfo | null;
  pricingSummary: PricingSummary;
  remainingSeconds: number | null;
  showReuploadNotice: boolean;
  isProcessing: boolean;
  isProofUploadExpired: boolean;
  onProofFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadProof: () => Promise<void>;
  onPayWithMidtrans: () => Promise<void>;
};

export const OrderSummaryCard = ({
  order,
  bankInfo,
  pricingSummary,
  remainingSeconds,
  showReuploadNotice,
  isProcessing,
  isProofUploadExpired,
  onProofFileChange,
  onUploadProof,
  onPayWithMidtrans,
}: OrderSummaryCardProps) => {
  const freeQuantityByProductId = extractQuantityBonusByProductId(
    order.discountNames,
  );

  return (
    <div className="lg:col-span-2 bg-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      {order.orderItems?.map((item) => (
        <div key={item.productId} className="flex justify-between text-sm mb-2">
          <div>
            {item.productName} x{item.quantity}
            {(freeQuantityByProductId[item.productId] ?? 0) > 0 && (
              <div className="text-xs text-primary font-medium">
                🎁 Free {freeQuantityByProductId[item.productId]} item
                {(freeQuantityByProductId[item.productId] ?? 0) > 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div>{formatRupiah(item.unitPrice * item.quantity)}</div>
        </div>
      ))}

      <hr className="my-4" />
      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>{formatRupiah(order.subtotal)}</span>
      </div>
      {pricingSummary.productDiscount > 0 && (
        <div className="flex justify-between mb-2">
          <span>Total Product Discount</span>
          <span className="text-red-500">
            - {formatRupiah(pricingSummary.productDiscount)}
          </span>
        </div>
      )}
      <div className="flex justify-between mb-2 items-center">
        <span>Shipping</span>
        {pricingSummary.hasShippingDiscount ? (
          <span className="flex items-center gap-2">
            <span className="line-through text-muted-foreground">
              {formatRupiah(pricingSummary.originalShippingCost)}
            </span>
            <span>{formatRupiah(pricingSummary.finalShippingCost)}</span>
          </span>
        ) : (
          <span>{formatRupiah(pricingSummary.finalShippingCost)}</span>
        )}
      </div>
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>{formatRupiah(order.grandTotal)}</span>
      </div>

      <div className="mt-6">
        {order.paymentType === "BANK_TRANSFER" ? (
          <BankTransferSection
            order={order}
            bankInfo={bankInfo}
            remainingSeconds={remainingSeconds}
            showReuploadNotice={showReuploadNotice}
            isProcessing={isProcessing}
            isProofUploadExpired={isProofUploadExpired}
            onProofFileChange={onProofFileChange}
            onUploadProof={onUploadProof}
          />
        ) : (
          <MidtransSection
            isProcessing={isProcessing}
            onPayWithMidtrans={onPayWithMidtrans}
          />
        )}
      </div>
    </div>
  );
};
