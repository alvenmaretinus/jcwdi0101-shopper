"use client";

import { OrderSummary, OrderItem } from "./OrderSummary";

interface Props {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountNote?: string;
  shippingCost: number;
  shippingOriginalCost?: number;
  shippingDiscount?: number;
  total: number;
  onPlaceOrder: () => void;
  isCreatingOrder: boolean;
}

export const SummarySidebar = ({
  items,
  subtotal,
  discount,
  discountNote,
  shippingCost,
  shippingOriginalCost,
  shippingDiscount,
  total,
  onPlaceOrder,
  isCreatingOrder,
}: Props) => {
  // OrderSummary already contains styling and Place Order button
  return (
    <OrderSummary
      items={items}
      subtotal={subtotal}
      discount={discount}
      discountNote={discountNote}
      shippingCost={shippingCost}
      shippingOriginalCost={shippingOriginalCost}
      shippingDiscount={shippingDiscount}
      total={total}
      onPlaceOrder={onPlaceOrder}
      isCreatingOrder={isCreatingOrder}
    />
  );
};

export default SummarySidebar;
