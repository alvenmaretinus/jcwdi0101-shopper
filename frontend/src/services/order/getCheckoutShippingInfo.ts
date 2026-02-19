import { apiFetch } from "@/lib/apiFetch";
import { ShippingCost } from "@/types/ShippingCost";

export type CheckoutShippingInfo = {
  store: {
    id: string;
    name: string;
    postCode: string | null;
    addressName: string;
  };
  distance: number;
  shippingMethods: ShippingCost;
};

type ApiResponse = {
  success: boolean;
  data: CheckoutShippingInfo;
};

/**
 * Fetch nearest store + shipping methods for a given address (Early Store Selection).
 * Called when user selects an address on the checkout page.
 */
export const getCheckoutShippingInfo = async (
  addressId: string
): Promise<CheckoutShippingInfo> => {
  const response = await apiFetch<ApiResponse>(
    "/order/checkout/shipping-info",
    {
      method: "POST",
      body: { addressId },
    }
  );

  return response.data;
};
