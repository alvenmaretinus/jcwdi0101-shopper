"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { extractShippingDiscount } from "../_lib/payment-utils";
import type {
  PaymentPageState,
  PricingSummary,
} from "./payment-page.types";
import { usePaymentActions } from "./usePaymentActions";
import { usePaymentCoreState } from "./usePaymentCoreState";
import { usePaymentRealtimeEffects } from "./usePaymentRealtimeEffects";

const emptyPricingSummary: PricingSummary = {
  originalShippingCost: 0,
  shippingDiscount: 0,
  finalShippingCost: 0,
  hasShippingDiscount: false,
  productDiscount: 0,
};

export const usePaymentPageState = (params: unknown): PaymentPageState => {
  const router = useRouter();
  const navigateToOrders = useCallback(() => {
    router.push("/profile/order");
  }, [router]);

  const { orderId, order, setOrder, loading, bankInfo, fetchOrder } =
    usePaymentCoreState(params);

  const { remainingSeconds, showReuploadNotice, clearTimers } =
    usePaymentRealtimeEffects({
      orderId,
      order,
      fetchOrder,
      setOrder,
      navigateToOrders,
    });

  const {
    isProcessing,
    onProofFileChange,
    onUploadProof,
    onPayWithMidtrans,
    onCancelOrder,
  } = usePaymentActions({
    orderId,
    order,
    setOrder,
    fetchOrder,
    clearTimers,
    navigateToOrders,
  });

  const pricingSummary = useMemo<PricingSummary>(() => {
    if (!order) return emptyPricingSummary;

    const originalShippingCost = Math.max(0, order.shippingCost);
    const shippingDiscount = Math.max(
      0,
      Math.min(extractShippingDiscount(order.discountNames), originalShippingCost)
    );
    const finalShippingCost = Math.max(0, originalShippingCost - shippingDiscount);
    return {
      originalShippingCost,
      shippingDiscount,
      finalShippingCost,
      hasShippingDiscount: shippingDiscount > 0,
      productDiscount: Math.max(0, order.totalDiscount - shippingDiscount),
    };
  }, [order]);

  return {
    loading,
    order,
    bankInfo,
    isProcessing,
    remainingSeconds,
    showReuploadNotice,
    pricingSummary,
    isProofUploadExpired: remainingSeconds !== null && remainingSeconds <= 0,
    onProofFileChange,
    onUploadProof,
    onPayWithMidtrans,
    onCancelOrder,
    onBackToOrders: navigateToOrders,
  };
};
