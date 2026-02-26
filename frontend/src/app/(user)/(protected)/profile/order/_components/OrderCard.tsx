"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, ShoppingBag } from "lucide-react";
import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/formatPrice";
import { confirmOrder } from "@/services/order/confirmOrder";
import { toast } from "sonner";
import Image from "next/image";
import OrderStatusBadge from "./OrderStatusBadge";

type UIOrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  bogoFreeQuantity?: number;
  image?: string;
};

type UIOrder = {
  id: string;
  date: string;
  status: string;
  statusLabel: string;
  rawStatus?: string;
  total: number;
  items: UIOrderItem[];
  address: string;
  paymentMethod?: string;
  paymentDeadline?: string | null;
  trackingNumber?: string | null;
  shippingCost?: number;
  shippingOriginalCost?: number;
  totalDiscount?: number;
  voucherCodes?: string[];
  voucherDiscountDetails?: Array<{ code: string; savedAmount: number }>;
  discountNames?: string[];
};

interface OrderCardProps {
  order: UIOrder;
  confirmingIds: string[];
  onConfirming: (id: string) => void;
  onConfirmed: (id: string) => void;
  onReload: () => Promise<void>;
}


export const OrderCard = ({
  order,
  confirmingIds,
  onConfirming,
  onConfirmed,
  onReload,
}: OrderCardProps) => {
  // Parse shipping discount from discountNames (format: "SHIPPING_DISCOUNT:28000")
  // Logic: finalShippingCost = shippingCost - shippingDiscount
  const shippingCostOriginal = Math.max(0, order.shippingCost ?? 0);
  let shippingDiscount = 0;
  
  if (Array.isArray(order.discountNames)) {
    for (const discount of order.discountNames) {
      if (discount.startsWith("SHIPPING_DISCOUNT:")) {
        const amountStr = discount.split(":")[1] || "0";
        const parsed = parseInt(amountStr, 10) || 0;
        shippingDiscount = Math.max(0, Math.min(parsed, shippingCostOriginal));
        break;
      }
    }
  }

  const shippingCostFinal = Math.max(0, shippingCostOriginal - shippingDiscount);
  const hasShippingDiscount = shippingDiscount > 0;
  const itemsSubtotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const voucherDiscountDetails = Array.isArray(order.voucherDiscountDetails)
    ? order.voucherDiscountDetails
    : [];
  const totalDiscountExcludingShipping = Math.max(
    0,
    (order.totalDiscount ?? 0) - shippingDiscount,
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-2xl font-semibold flex items-center gap-2 mb-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Order {order.id}
          </p>
          <p className="text-sm text-muted-foreground">{order.date}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Payment Deadline Alert */}
      {order.status === "pending" && order.paymentDeadline && (
        <div className="mb-6 p-3 bg-amber-50 rounded-lg text-sm text-amber-700 flex items-center gap-2">
          <span>⏰</span>
          <span>Pay before {order.paymentDeadline} to avoid cancellation</span>
        </div>
      )}

      <Separator className="mb-6" />

      {/* Order Items */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
        {order.items.map((item, index) => (
          <div key={`${item.productId}-${index}`} className="border border-border rounded-lg p-4">
            <div className="flex gap-4">
              {item.image ? (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0 text-2xl">
                  📦
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm mb-2 line-clamp-2">{item.name}</p>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                  {(item.bogoFreeQuantity ?? 0) > 0 && (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-green-50 text-green-700">
                      🎁 Free {item.bogoFreeQuantity}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {typeof item.originalPrice === "number" && item.originalPrice > item.price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                <p className="text-sm font-bold text-primary">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Delivery Address */}
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
            <p className="text-sm font-medium line-clamp-3">{order.address}</p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Pricing Summary */}
      <div className="space-y-3 mb-6 bg-muted/20 rounded-lg p-4">
        <div className="space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatPrice(itemsSubtotal)}
            </span>
          </div>

          {voucherDiscountDetails.length > 0 && (
            <div className="space-y-1">
              {voucherDiscountDetails.map((voucher) => (
                <div
                  key={voucher.code}
                  className="flex justify-between text-xs"
                >
                  <span className="text-muted-foreground">
                    Voucher {voucher.code}
                  </span>
                  <span className="text-red-500">
                    -{formatPrice(voucher.savedAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalDiscountExcludingShipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Discount</span>
              <span className="text-red-500 font-medium">
                -{formatPrice(totalDiscountExcludingShipping)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-border">
            {/* Shipping - WITH STRIKETHROUGH when has discount */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping
              </span>
              {hasShippingDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(shippingCostOriginal)}
                  </span>
                  {shippingCostFinal === 0 ? (
                    <Badge className="bg-green-50 text-green-700 text-xs font-semibold">FREE</Badge>
                  ) : (
                    <span className="text-sm font-medium">{formatPrice(shippingCostFinal)}</span>
                  )}
                </div>
              ) : (
                <span className="font-medium">{formatPrice(shippingCostFinal)}</span>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Grand Total */}
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary text-xl">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {order.status === "pending" && (
          <div className="space-y-2">
            {order.paymentMethod === "Payment Gateway" ? (
              <Link href={`/order/${order.id}/payment`} className="block">
                <Button className="w-full rounded-full py-5 text-base font-semibold shadow-lg shadow-primary/20">
                  Pay (Midtrans)
                </Button>
              </Link>
            ) : order.rawStatus === "PAYMENT_WAITING_CONFIRMATION" ? (
              <div className="w-full p-4 bg-yellow-50 text-yellow-700 text-sm rounded-full text-center font-medium">
                ⏳ Menunggu konfirmasi admin
              </div>
            ) : (
              <Link href={`/order/${order.id}/payment`} className="block">
                <Button className="w-full rounded-full py-5 text-base font-semibold shadow-lg shadow-primary/20">
                  Upload Proof
                </Button>
              </Link>
            )}
          </div>
        )}

        {order.status === "shipping" && (
          <Button
            className="w-full rounded-full py-5 text-base font-semibold shadow-lg shadow-primary/20"
            disabled={confirmingIds.includes(order.id)}
            onClick={async () => {
              try {
                onConfirming(order.id);
                await confirmOrder(order.id);
                toast.success("Pesanan selesai. Terima kasih.");
                await onReload();
              } catch (err: unknown) {
                console.error("Failed to confirm order", err);
                const msg = err instanceof Error ? err.message : String(err);
                toast.error(msg || "Gagal mengkonfirmasi pesanan");
              } finally {
                onConfirmed(order.id);
              }
            }}
          >
            {confirmingIds.includes(order.id) ? "Confirming..." : "Complete Order"}
          </Button>
        )}
      </div>

      {/* Additional Info */}
      {Array.isArray(order.discountNames) && order.discountNames.length > 0 && (
        <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
          Applied discounts: {order.discountNames.length} discount
          {order.discountNames.length > 1 ? "s" : ""} applied
        </p>
      )}
    </div>
  );
};

export default OrderCard;
