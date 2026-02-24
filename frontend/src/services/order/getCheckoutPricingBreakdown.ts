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
  itemLevelDiscount: number;
  globalDiscount: number;
  totalDiscount: number;
  grandTotal: number;
  items: ItemBreakdown[];
  globalAppliedDiscounts?: AppliedDiscount[];
}

export async function getCheckoutPricingBreakdown(
  addressId: string,
  voucherIds?: string[],
  discountIds?: string[]
): Promise<CheckoutPricingResponse> {
  const response = await apiFetch<{ data: CheckoutPricingResponse }>(
    "/order/checkout/pricing-breakdown",
    {
      method: HttpMethod.POST,
      body: {
        addressId,
        voucherIds,
        discountIds,
      },
    }
  );

  return response.data;
}
