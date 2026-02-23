import { apiFetch, HttpMethod } from "@/lib/apiFetch";

export interface CalculateVoucherRequest {
  voucherCodes: string[];
  subtotal: number;
  shippingCost?: number;
  cartItems?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface CalculateVoucherResponse {
  shippingCost?: number;
  productDiscount?: number;
  shippingDiscount?: number;
  quantityBonuses?: Array<{
    productId: string;
    freeQuantity: number;
  }>;
  totalDiscount: number;
  subtotal: number;
  finalAmount: number;
}

export const calculateVoucher = async (data: CalculateVoucherRequest) => {
  return apiFetch<CalculateVoucherResponse>("/vouchers/calculate-discount", {
    method: HttpMethod.POST,
    body: data,
  });
};
