import { apiFetch } from "@/lib/apiFetch";
import {
  GetShippingCostInput,
  GetShippingCostSchema,
} from "@/schemas/shipping-cost/GetShippingCostSchema";
import { toast } from "sonner";
import { ShippingCost } from "@/types/ShippingCost";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export const getShippingCost = async (
  inputData: GetShippingCostInput,
  headers?: ReadonlyHeaders
) => {
  const parsedResult = GetShippingCostSchema.safeParse(inputData);

  if (!parsedResult.success) {
    const firstError = parsedResult.error.issues[0].message;
    console.warn(parsedResult.error.message);
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  const { destinationPostCode, originPostCode, weight, itemValue } = inputData;
  const params = new URLSearchParams({
    originPostCode,
    destinationPostCode,
    weight: String(weight),
    itemValue: String(itemValue),
  });

  const data = await apiFetch<ShippingCost>(`/shipping-cost?${params}`, {
    method: "GET",
    headers,
  });

  return data;
};
