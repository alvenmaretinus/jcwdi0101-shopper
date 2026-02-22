"use client";

import { Loader2 } from "lucide-react";
import { usePaymentPageState } from "./_hooks/usePaymentPageState";
import { OrderSummaryCard } from "./_components/OrderSummaryCard";
import { OrderStatusCard } from "./_components/OrderStatusCard";

type PaymentPageProps = {
  params: unknown;
};

export default function PaymentPage({ params }: PaymentPageProps) {
  const {
    loading,
    order,
    bankInfo,
    isProcessing,
    remainingSeconds,
    showReuploadNotice,
    pricingSummary,
    isProofUploadExpired,
    onProofFileChange,
    onUploadProof,
    onPayWithMidtrans,
    onCancelOrder,
    onBackToOrders,
  } = usePaymentPageState(params);

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="container-app py-8">Order not found</div>;
  }

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-6">Payment for Order {order.id}</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <OrderSummaryCard
          order={order}
          bankInfo={bankInfo}
          pricingSummary={pricingSummary}
          remainingSeconds={remainingSeconds}
          showReuploadNotice={showReuploadNotice}
          isProcessing={isProcessing}
          isProofUploadExpired={isProofUploadExpired}
          onProofFileChange={onProofFileChange}
          onUploadProof={onUploadProof}
          onPayWithMidtrans={onPayWithMidtrans}
        />
        <OrderStatusCard
          order={order}
          isProcessing={isProcessing}
          onCancelOrder={onCancelOrder}
          onBackToOrders={onBackToOrders}
        />
      </div>
    </div>
  );
}
