import { apiFetch } from "@/lib/apiFetch";

export interface CalculateVoucherRequest {
  voucherIds: string[];
  subtotal: number;
}

export interface CalculateVoucherResponse {
  totalDiscount: number;
  subtotal: number;
  finalAmount: number;
}

export const calculateVoucher = async (data: CalculateVoucherRequest) => {
  return apiFetch<CalculateVoucherResponse>("/vouchers/calculate-discount", {
    method: "POST",
    body: data,
  });
};
