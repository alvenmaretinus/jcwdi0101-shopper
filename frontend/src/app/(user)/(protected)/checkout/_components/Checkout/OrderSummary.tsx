"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { DiscountBreakdown } from "./DiscountBreakdown";
import { CheckoutPricingResponse } from "@/services/order/getCheckoutPricingBreakdown";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  bogoFreeQuantity?: number;
  image: string;
}

export interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  shippingOriginalCost?: number;
  shippingDiscount?: number;
  total: number;
  onPlaceOrder: () => void;
  isCreatingOrder?: boolean;
  pricingBreakdown?: CheckoutPricingResponse | null;
  isLoadingPricing?: boolean;
}

export const OrderSummary = ({
  items,
  subtotal,
  totalDiscount,
  shippingCost,
  shippingOriginalCost,
  shippingDiscount = 0,
  total,
  onPlaceOrder,
  isCreatingOrder = false,
  pricingBreakdown,
  isLoadingPricing = false,
}: OrderSummaryProps) => {
  const originalShipping = Math.max(
    0,
    shippingOriginalCost !== undefined ? shippingOriginalCost : shippingCost
  );
  const appliedShippingDiscount = Math.max(
    0,
    Math.min(shippingDiscount, originalShipping)
  );
  const finalShipping = Math.max(0, shippingCost);
  const hasShippingDiscount =
    appliedShippingDiscount > 0 && originalShipping > finalShipping;
  const appliedVoucherDiscounts = pricingBreakdown?.appliedVoucherDiscounts ?? [];
  const defaultProductDiscount = Math.max(
    0,
    pricingBreakdown?.defaultProductDiscount ?? 0
  );
  const totalDiscountValue = Math.max(
    0,
    pricingBreakdown?.totalDiscountExcludingShipping ?? totalDiscount
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft sticky top-24">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        Order Summary
      </h2>

      <div className="space-y-4 mb-6 max-h-75 overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity}
              </p>
              {(item.bogoFreeQuantity ?? 0) > 0 && (
                <p className="text-xs text-primary">
                  +{item.bogoFreeQuantity} item bonus (promo/voucher)
                </p>
              )}
              {typeof item.originalPrice === "number" &&
              item.originalPrice > item.price ? (
                <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground line-through text-xs">
                    Rp {item.originalPrice.toLocaleString("id-ID")}
                  </span>
                  <span>Rp {item.price.toLocaleString("id-ID")}</span>
                </p>
              ) : (
                <p className="text-sm font-semibold mt-1">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Discount Breakdown Section */}
      {pricingBreakdown && !isLoadingPricing && (
        <>
          <div className="mb-6">
            <DiscountBreakdown items={pricingBreakdown.items} />
          </div>
          <Separator className="my-6" />
        </>
      )}

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>
        {appliedVoucherDiscounts.length > 0 && (
          <div className="space-y-1">
            {appliedVoucherDiscounts.map((voucher) => (
              <div
                key={`${voucher.code}-${voucher.type}`}
                className="flex justify-between text-xs"
              >
                <span className="text-muted-foreground">
                  Voucher {voucher.code}
                </span>
                <span className="text-red-500">
                  -Rp {voucher.savedAmount.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        )}
        {defaultProductDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Product Discount</span>
            <span className="text-red-500">
              -Rp {defaultProductDiscount.toLocaleString("id-ID")}
            </span>
          </div>
        )}
        {totalDiscountValue > 0 && (
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Total Discount</span>
            <span className="text-red-500">
              -Rp {totalDiscountValue.toLocaleString("id-ID")}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping Cost</span>
          {hasShippingDiscount ? (
            <span className="flex items-center gap-2">
              <span className="line-through text-muted-foreground">
                Rp {originalShipping.toLocaleString("id-ID")}
              </span>
              <span>Rp {finalShipping.toLocaleString("id-ID")}</span>
            </span>
          ) : (
            <span>Rp {finalShipping.toLocaleString("id-ID")}</span>
          )}
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <Button
        className="w-full mt-8 rounded-full py-6 text-lg font-semibold shadow-lg shadow-primary/20"
        onClick={onPlaceOrder}
        disabled={isCreatingOrder}
      >
        {isCreatingOrder ? "Processing..." : "Place Order"}
      </Button>

      <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
        By clicking Place Order, you agree to our Terms and Conditions.
      </p>
    </div>
  );
};
