"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";

import { apiFetch } from "@/lib/apiFetch";
import { confirmOrder } from "@/services/order/confirmOrder";
import { toast } from "sonner";
import type {
  CreateOrderResponse,
  OrderItem as OrderServiceItem,
} from "@/services/order/createOrder";

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

// const mockOrders: UIOrder[] = [];

const Orders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingIds, setConfirmingIds] = useState<string[]>([]);

  // Extracted loader so it can be reused after actions
  const loadOrders = async () => {
    setLoading(true);
    try {
      const resp = await apiFetch<
        | { success?: boolean; data?: CreateOrderResponse[] }
        | CreateOrderResponse[]
      >("/order", { method: "GET" });
      const maybe = resp as { data?: CreateOrderResponse[] };
      const data = maybe.data ?? (resp as CreateOrderResponse[]);

      const mapped: UIOrder[] = (Array.isArray(data) ? data : []).map(
        (o: CreateOrderResponse) => {
          const statusMap: Record<string, string> = {
            PAYMENT_PENDING: "pending",
            PAYMENT_WAITING_CONFIRMATION: "pending",
            PAYMENT_EXPIRED: "cancelled",
            PROCESSING: "processing",
            SHIPPED: "shipping",
            DELIVERED: "delivered",
            CANCELLED: "cancelled",
          };

          const status = statusMap[o.status] ?? "processing";

          return {
            id: o.id,
            date: new Date(o.createdAt).toLocaleDateString(),
            status,
            rawStatus: o.status,
            statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
            total: o.grandTotal ?? 0,
            items: Array.isArray(o.orderItems)
              ? o.orderItems.map((it: OrderServiceItem) => ({
                  name: it.productName,
                  quantity: it.quantity,
                  price: it.unitPrice,
                  image: undefined,
                }))
              : [],
            address: o.shippingAddress ?? o.storeAddress ?? "",
            paymentMethod:
              o.paymentType === "BANK_TRANSFER"
                ? "Bank Transfer"
                : "Payment Gateway",
            paymentDeadline: o.paymentDueAt
              ? new Date(o.paymentDueAt).toLocaleString()
              : null,
            trackingNumber: o.trackingNumber ?? null,
          };
        }
      );

      setOrders(mapped);
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case "shipping":
        return <Truck className="h-5 w-5 text-orange-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-berry" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-primary/10 text-primary border-primary/20";
      case "shipping":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "processing":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "cancelled":
        return "bg-berry/10 text-berry border-berry/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container-app py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Orders</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card p-1 rounded-full mb-6 inline-flex">
            <TabsTrigger
              value="all"
              className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="processing"
              className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Processing
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Shipping
            </TabsTrigger>
            <TabsTrigger
              value="delivered"
              className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Delivered
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {loading ? (
              <div className="p-6 text-center">Loading orders...</div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-2xl shadow-soft overflow-hidden"
                >
                  {/* Order header */}
                  <div className="p-4 md:p-6 border-b border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-semibold">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          className={`${getStatusColor(order.status)} border`}
                        >
                          {order.statusLabel}
                        </Badge>
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
                            ) : // For bank transfer: show Upload only when rawStatus === PAYMENT_PENDING
                            order.rawStatus ===
                              "PAYMENT_WAITING_CONFIRMATION" ? (
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
                        {/* status label already shown in Badge above; remove duplicate */}
                        {order.status === "shipping" && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                            disabled={confirmingIds.includes(order.id)}
                            onClick={async () => {
                              try {
                                setConfirmingIds((s) => [...s, order.id]);
                                await confirmOrder(order.id);
                                toast.success(
                                  "Pesanan dikonfirmasi — Terima kasih"
                                );
                                await loadOrders();
                              } catch (err: unknown) {
                                console.error("Failed to confirm order", err);
                                const msg =
                                  err instanceof Error
                                    ? err.message
                                    : String(err);
                                toast.error(
                                  msg || "Gagal mengkonfirmasi pesanan"
                                );
                              } finally {
                                setConfirmingIds((s) =>
                                  s.filter((id) => id !== order.id)
                                );
                              }
                            }}
                          >
                            {confirmingIds.includes(order.id)
                              ? "Confirming..."
                              : "Confirm Receipt"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {order.status === "pending" && order.paymentDeadline && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                        ⏰ Pay before {order.paymentDeadline} to avoid
                        cancellation
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
                          <p className="font-medium">
                            {formatPrice(item.price)}
                          </p>
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
                        <span className="truncate max-w-48">
                          {order.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-bold text-lg">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-2xl p-12 text-center shadow-soft">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  You don&apos;t have any orders in this category yet.
                </p>
                <Link href="/products">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;
