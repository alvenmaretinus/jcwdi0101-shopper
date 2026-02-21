"use client";

import { Button } from "@/components/ui/button";
import type { CreateOrderResponse } from "@/services/order/createOrder";

type OrderStatusCardProps = {
  order: CreateOrderResponse;
  isProcessing: boolean;
  onCancelOrder: () => Promise<void>;
  onBackToOrders: () => void;
};

export const OrderStatusCard = ({
  order,
  isProcessing,
  onCancelOrder,
  onBackToOrders,
}: OrderStatusCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6">
      <h3 className="font-semibold mb-4">Status</h3>
      <div>Order status: {order.status}</div>
      <div className="mt-4">
        {order.status === "PAYMENT_PENDING" && (
          <div className="mb-2">
            <Button
              variant="destructive"
              onClick={onCancelOrder}
              disabled={isProcessing || order.status !== "PAYMENT_PENDING"}
              className="w-full md:w-auto"
            >
              {isProcessing ? "Processing..." : "Cancel Order"}
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={onBackToOrders}
          className="w-full md:w-auto"
        >
          Back to Orders
        </Button>
      </div>
    </div>
  );
};
