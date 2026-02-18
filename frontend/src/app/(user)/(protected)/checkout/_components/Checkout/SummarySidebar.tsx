"use client";

import { OrderSummary, OrderItem } from "./OrderSummary";

interface Props {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  onPlaceOrder: () => void;
  isCreatingOrder: boolean;
  isCartLoading: boolean;
  disablePlace?: boolean;
}

export const SummarySidebar = ({
  items,
  subtotal,
  discount,
  shippingCost,
  total,
  onPlaceOrder,
  isCreatingOrder,
  isCartLoading,
  disablePlace,
}: Props) => {
  // OrderSummary already contains styling and Place Order button
  return (
    <OrderSummary
      items={items}
      subtotal={subtotal}
      discount={discount}
      shippingCost={shippingCost}
      total={total}
      onPlaceOrder={onPlaceOrder}
      isCreatingOrder={isCreatingOrder}
    />
  );
};

export default SummarySidebar;
