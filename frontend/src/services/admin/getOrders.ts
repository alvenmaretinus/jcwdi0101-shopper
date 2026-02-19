import { apiFetch } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  userId: string;
  user?: { email?: string };
  storeId?: string;
  storeName?: string;
  shippingAddress?: string;
  subtotal: number;
  shippingCost: number;
  totalDiscount: number;
  grandTotal: number;
  paymentType?: string;
  status?: string;
  paymentDueAt?: string;
  paymentProofUrl?: string | null;
  orderItems?: AdminOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GetOrdersResponse {
  data: AdminOrder[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const isGetOrdersResponse = (value: unknown): value is GetOrdersResponse => {
  if (!value || typeof value !== "object") return false;
  if (!("data" in value)) return false;
  const data = (value as { data: unknown }).data;
  return Array.isArray(data);
};

export const getOrders = async ({
  page = 1,
  limit = 20,
  status,
  search,
  headers,
}: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  headers?: ReadonlyHeaders;
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const res = await apiFetch<unknown>(`/order?${params.toString()}`, {
    method: "GET",
    headers,
  });

  // API may return { success, data, pagination } or raw array
  if (isGetOrdersResponse(res)) return res;
  return { data: res as AdminOrder[] };
};
