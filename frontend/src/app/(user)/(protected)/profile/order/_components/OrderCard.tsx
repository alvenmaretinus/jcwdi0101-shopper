"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { confirmOrder } from "@/services/order/confirmOrder";
import { toast } from "sonner";
import OrderStatusBadge from "./OrderStatusBadge";

type UIOrderItem = {
  name: string;
  quantity: number;
  price: number;
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
  return (
    <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
      {/* Order header */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold">{order.id}</p>
              <p className="text-sm text-muted-foreground">{order.date}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OrderStatusBadge status={order.status} />
            {order.status === "pending" && (
              <div className="flex items-center gap-2">
                {order.paymentMethod === "Payment Gateway" ? (
                  <Link href={`/order/${order.id}/payment`}>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                    >
                      Pay (Midtrans)
                    </Button>
                  </Link>
                ) : order.rawStatus === "PAYMENT_WAITING_CONFIRMATION" ? (
                  <div className="text-sm text-yellow-700">
                    Menunggu konfirmasi admin
                  </div>
                ) : (
                  <Link href={`/order/${order.id}/payment`}>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                    >
                      Upload Proof
                    </Button>
                  </Link>
                )}
              </div>
            )}
            {order.status === "shipping" && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                disabled={confirmingIds.includes(order.id)}
                onClick={async () => {
                  try {
                    onConfirming(order.id);
                    await confirmOrder(order.id);
                    toast.success("Pesanan selesai. Terima kasih.");
                    await onReload();
                  } catch (err: unknown) {
                    console.error("Failed to confirm order", err);
                    const msg =
                      err instanceof Error ? err.message : String(err);
                    toast.error(msg || "Gagal mengkonfirmasi pesanan");
                  } finally {
                    onConfirmed(order.id);
                  }
                }}
              >
                {confirmingIds.includes(order.id)
                  ? "Confirming..."
                  : "Complete Order"}
              </Button>
            )}
          </div>
        </div>

        {order.status === "pending" && order.paymentDeadline && (
          <div className="mt-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
            ⏰ Pay before {order.paymentDeadline} to avoid cancellation
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="p-4 md:p-6">
        <div className="space-y-3">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                {item.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  x{item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.price)}</p>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-muted-foreground">
              +{order.items.length - 2} more items
            </p>
          )}
        </div>

        <hr className="my-4 border-border" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-48">{order.address}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-bold text-lg">{formatPrice(order.total)}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
