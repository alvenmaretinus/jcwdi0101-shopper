"use client";

import { useEffect, useState } from "react";
import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import type {
  CreateOrderResponse,
  OrderItem as OrderServiceItem,
} from "@/services/order/createOrder";
import OrderTabs from "./_components/OrderTabs";
import OrderCard from "./_components/OrderCard";
import EmptyOrdersState from "./_components/EmptyOrdersState";
import OrderPagination from "./_components/OrderPagination";
import OrderFilters from "./_components/OrderFilters";

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
  dateKey: string;
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

const ITEMS_PER_PAGE = 5;

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingIds, setConfirmingIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderNumberQuery, setOrderNumberQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Extracted loader so it can be reused after actions
  const loadOrders = async () => {
    setLoading(true);
    try {
      const resp = await apiFetch<
        | { success?: boolean; data?: CreateOrderResponse[] }
        | CreateOrderResponse[]
      >("/order", { method: HttpMethod.GET });
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
            COMPLETED: "completed",
            CANCELLED: "cancelled",
          };

          // Parse quantity bonus tokens from discountNames
          // Supported formats:
          // - "PROMO_QTY_BONUSES:productId1:qty1|productId2:qty2"
          // - "VOUCHER_QTY_BONUSES:productId1:qty1|productId2:qty2"
          const bogoFreeQuantityMap: Record<string, number> = {};
          const voucherDiscountMap: Record<string, number> = {};
          let voucherProductDiscountTotal = 0;
          const quantityBonusPrefixes = ["PROMO_QTY_BONUSES:", "VOUCHER_QTY_BONUSES:"];

          const parseQuantityBonusEntries = (rawValue: string) => {
            rawValue.split("|").forEach((entry) => {
              const [productIdRaw, freeQtyRaw] = entry.split(":");
              const productId = (productIdRaw ?? "").trim();
              const freeQty = Math.max(0, parseInt(freeQtyRaw || "0", 10) || 0);
              if (productId && freeQty > 0) {
                bogoFreeQuantityMap[productId] =
                  (bogoFreeQuantityMap[productId] ?? 0) + freeQty;
              }
            });
          };

          if (Array.isArray(o.discountNames)) {
            for (const discount of o.discountNames) {
              if (discount.startsWith("VOUCHER_PRODUCT_DISCOUNT:")) {
                const rawAmount = discount.slice("VOUCHER_PRODUCT_DISCOUNT:".length);
                voucherProductDiscountTotal = Math.max(
                  0,
                  parseInt(rawAmount || "0", 10) || 0,
                );
                continue;
              }

              if (discount.startsWith("VOUCHER_APPLIED_AMOUNTS:")) {
                const rawValue = discount.slice("VOUCHER_APPLIED_AMOUNTS:".length);
                rawValue.split("|").forEach((entry) => {
                  const [codeRaw, amountRaw] = entry.split(":");
                  const code = (codeRaw ?? "").trim();
                  const savedAmount = Math.max(
                    0,
                    parseInt(amountRaw || "0", 10) || 0,
                  );
                  if (!code || savedAmount <= 0) {
                    return;
                  }

                  voucherDiscountMap[code] =
                    (voucherDiscountMap[code] ?? 0) + savedAmount;
                });
                continue;
              }

              const matchedPrefix = quantityBonusPrefixes.find((prefix) =>
                discount.startsWith(prefix),
              );
              if (!matchedPrefix) {
                continue;
              }

              const rawValue = discount.slice(matchedPrefix.length);
              parseQuantityBonusEntries(rawValue);
            }
          }

          const fallbackVoucherCodes = Array.isArray(o.voucherCodes)
            ? o.voucherCodes.filter((code) =>
                !code.toLowerCase().includes("freeship"),
              )
            : [];

          if (
            Object.keys(voucherDiscountMap).length === 0 &&
            voucherProductDiscountTotal > 0 &&
            fallbackVoucherCodes.length === 1
          ) {
            voucherDiscountMap[fallbackVoucherCodes[0]] = voucherProductDiscountTotal;
          }

          const voucherDiscountDetails = Object.entries(voucherDiscountMap)
            .map(([code, savedAmount]) => ({ code, savedAmount }))
            .filter((line) => line.code.length > 0 && line.savedAmount > 0);

          const status = statusMap[o.status] ?? "processing";
          const createdAtDate = new Date(o.createdAt);

          return {
            id: o.id,
            date: createdAtDate.toLocaleDateString(),
            dateKey: toDateKey(createdAtDate),
            status,
            rawStatus: o.status,
            statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
            total: o.grandTotal ?? 0,
            shippingCost: o.shippingCost ?? 0,
            shippingOriginalCost: o.shippingCost ?? 0,
            totalDiscount: o.totalDiscount ?? 0,
            voucherCodes: Array.isArray(o.voucherCodes) ? o.voucherCodes : [],
            voucherDiscountDetails,
            discountNames: Array.isArray(o.discountNames) ? o.discountNames : [],
            items: Array.isArray(o.orderItems)
              ? o.orderItems.map((it: OrderServiceItem) => ({
                  productId: it.productId,
                  name: it.productName,
                  quantity: it.quantity,
                  price: it.unitPrice,
                  originalPrice: (it as any).originalPrice ?? (it as any).priceBeforeDiscount,
                  bogoFreeQuantity: bogoFreeQuantityMap[it.productId] ?? 0,
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

  useEffect(() => {
    setCurrentPage(1);
  }, [orderNumberQuery, selectedDate]);

  const searchTerm = orderNumberQuery.trim().toLowerCase();
  const isExtraFilterActive = searchTerm.length > 0 || selectedDate.length > 0;

  // Filter orders by tab + search query + date
  const filteredOrders = orders.filter((order) => {
    if (activeTab !== "all" && order.status !== activeTab) return false;
    if (searchTerm && !order.id.toLowerCase().includes(searchTerm)) return false;
    if (selectedDate && order.dateKey !== selectedDate) return false;
    return true;
  });

  // Pagination logic
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIdx, endIdx);

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container-app py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Orders</h1>

        <OrderTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <OrderFilters
          orderNumberQuery={orderNumberQuery}
          selectedDate={selectedDate}
          onOrderNumberChange={setOrderNumberQuery}
          onDateChange={setSelectedDate}
          onClearFilters={() => {
            setOrderNumberQuery("");
            setSelectedDate("");
          }}
        />

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
                  onConfirming={(id: string) => setConfirmingIds((s) => [...s, id])}
                  onConfirmed={(id: string) =>
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
            <EmptyOrdersState isSearchActive={isExtraFilterActive} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
