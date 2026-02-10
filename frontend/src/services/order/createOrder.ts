import { apiFetch } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export interface CreateOrderRequest {
  addressId: string;
  paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY";
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
  paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY";
  status:
    | "PAYMENT_PENDING"
    | "PAYMENT_VERIFIED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED";
  paymentDueAt: string;
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
export const createOrder = async (
  data: CreateOrderRequest,
  headers?: ReadonlyHeaders | Headers
) => {
  const response = await apiFetch<CreateOrderResponse>("/order/checkout", {
    method: "POST",
    headers,
    body: data,
  });

  return response;
};
