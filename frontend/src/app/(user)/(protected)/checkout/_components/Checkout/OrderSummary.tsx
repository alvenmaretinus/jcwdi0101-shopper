"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  onPlaceOrder: () => void;
}

export const OrderSummary = ({
  items,
  subtotal,
  discount,
  shippingCost,
  total,
  onPlaceOrder,
}: OrderSummaryProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft sticky top-24">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        Order Summary
      </h2>

      <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity}
              </p>
              <p className="text-sm font-semibold mt-1">
                Rp {item.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>
        <div className={`flex justify-between text-sm ${discount>0 ? "" : "hidden"}`}>
          <span className="text-muted-foreground">Discount</span>
          <span className="text-red-500">
             Rp {discount.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping Cost</span>
          <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
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
      >
        Place Order
      </Button>

      <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
        By clicking "Place Order", you agree to our Terms and Conditions.
      </p>
    </div>
  );
};
