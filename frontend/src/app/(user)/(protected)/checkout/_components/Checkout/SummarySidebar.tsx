"use client";

import { OrderSummary, OrderItem } from "./OrderSummary";
import { CheckoutPricingResponse } from "@/services/order/getCheckoutPricingBreakdown";

interface Props {
  items: OrderItem[];
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  shippingOriginalCost?: number;
  shippingDiscount?: number;
  total: number;
  onPlaceOrder: () => void;
  isCreatingOrder: boolean;
  pricingBreakdown?: CheckoutPricingResponse | null;
  isLoadingPricing?: boolean;
}

export const SummarySidebar = ({
  items,
  subtotal,
  totalDiscount,
  shippingCost,
  shippingOriginalCost,
  shippingDiscount,
  total,
  onPlaceOrder,
  isCreatingOrder,
  pricingBreakdown,
  isLoadingPricing,
}: Props) => {
  // OrderSummary already contains styling and Place Order button
  return (
    <OrderSummary
      items={items}
      subtotal={subtotal}
      totalDiscount={totalDiscount}
      shippingCost={shippingCost}
      shippingOriginalCost={shippingOriginalCost}
      shippingDiscount={shippingDiscount}
      total={total}
      onPlaceOrder={onPlaceOrder}
      isCreatingOrder={isCreatingOrder}
      pricingBreakdown={pricingBreakdown}
      isLoadingPricing={isLoadingPricing}
    />
  );
};

export default SummarySidebar;
