"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import type {
  CreateOrderResponse,
  OrderItem as OrderServiceItem,
} from "@/services/order/createOrder";
import OrderTabs from "./_components/OrderTabs";
import OrderCard from "./_components/OrderCard";
import EmptyOrdersState from "./_components/EmptyOrdersState";
import OrderPagination from "./_components/OrderPagination";

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

const ITEMS_PER_PAGE = 5;

const Orders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingIds, setConfirmingIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when tab changes
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter orders by tab
  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  // Pagination logic
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIdx, endIdx);

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container-app py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Orders</h1>

        <OrderTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="space-y-4">
          {loading ? (
            <div className="p-6 text-center">Loading orders...</div>
          ) : filteredOrders.length > 0 ? (
            <>
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  confirmingIds={confirmingIds}
                  onConfirming={(id) => setConfirmingIds((s) => [...s, id])}
                  onConfirmed={(id) =>
                    setConfirmingIds((s) => s.filter((x) => x !== id))
                  }
                  onReload={loadOrders}
                />
              ))}
              <OrderPagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
                onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      Math.ceil(filteredOrders.length / ITEMS_PER_PAGE),
                      p + 1
                    )
                  )
                }
              />
            </>
          ) : (
            <EmptyOrdersState />
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
