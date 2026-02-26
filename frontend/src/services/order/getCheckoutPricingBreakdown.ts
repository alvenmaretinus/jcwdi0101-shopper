import { apiFetch, HttpMethod } from "@/lib/apiFetch";

export interface AppliedDiscount {
  id: string;
  name: string;
  label: string;
  savedAmount: number;
  endsAt?: Date | null;
}

export interface ItemBreakdown {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  totalDiscount: number;
  bogoFreeQuantity: number;
  appliedDiscounts: AppliedDiscount[];
}

export interface CheckoutPricingResponse {
  subtotal: number;
  defaultProductDiscount: number;
  voucherDiscount: number;
  totalDiscountExcludingShipping: number;
  productDiscount: number;
  shippingDiscount: number;
  shippingCost: number;
  finalShippingCost: number;
  totalDiscount: number;
  grandTotal: number;
  items: ItemBreakdown[];
  appliedVouchers?: Array<{
    code: string;
    type: "PRODUCT" | "QUANTITY" | "SHIPPING";
    savedAmount: number;
  }>;
  appliedVoucherDiscounts?: Array<{
    code: string;
    type: "PRODUCT" | "QUANTITY";
    savedAmount: number;
  }>;
}

export async function getCheckoutPricingBreakdown(
  addressId: string,
  voucherIds?: string[],
  discountIds?: string[],
  shippingCost?: number,
): Promise<CheckoutPricingResponse> {
  const response = await apiFetch<{ data: CheckoutPricingResponse }>(
    "/order/checkout/pricing-breakdown",
    {
      method: HttpMethod.POST,
      body: {
        addressId,
        voucherIds,
        discountIds,
        shippingCost,
      },
    }
  );

  return response.data;
}
