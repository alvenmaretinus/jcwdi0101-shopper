import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface CreateOrderRequest {
  addressId: string;
  paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY";
  voucherIds?: string[];
  shippingCost?: number;
  shippingMethod?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderResponse {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  userAddressId: string;
  shippingAddress: string;
  subtotal: number;
  shippingCost: number;
  totalDiscount: number;
  grandTotal: number;
  voucherCodes: string[];
  discountNames: string[];
  paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY";
  status:
    | "PAYMENT_PENDING"
    | "PAYMENT_WAITING_CONFIRMATION"
    | "PAYMENT_VERIFIED"
    | "PAYMENT_EXPIRED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "PAID";
  paymentDueAt: string;
  paymentProofUrl?: string | null;
  trackingNumber?: string | null;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a pending order (checkout)
 * Backend will automatically:
 * - Find nearest store within 5 km radius of the address
 * - Validate stock availability
 * - Calculate shipping cost using RajaOngkir API
 * - Create order with status PAYMENT_PENDING
 *
 * @param data Order creation data (addressId, paymentType)
 * @param headers Optional headers for authentication
 * @returns Created order response with actual shipping cost
 * @throws Error if address invalid, cart empty, or no store within 5km
 */
type ApiWrapper<T> = { success?: boolean; data?: T };

function isApiWrapper<T>(v: unknown): v is ApiWrapper<T> {
  return typeof v === "object" && v !== null && "data" in (v as object);
}

export const createOrder = async (
  data: CreateOrderRequest,
  headers?: ReadonlyHeaders | Headers
): Promise<CreateOrderResponse | null> => {
  const response = await apiFetch<
    ApiWrapper<CreateOrderResponse> | CreateOrderResponse
  >("/order/checkout", {
    method: HttpMethod.POST,
    headers,
    body: data,
  });

  if (isApiWrapper<CreateOrderResponse>(response)) {
    return response.data ?? null;
  }

  return response as CreateOrderResponse;
};
