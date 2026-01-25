import { apiFetch } from "@/lib/apiFetch";
import {
  GetShippingCostInput,
  GetShippingCostSchema,
} from "@/schemas/shipping-cost/GetShippingCostSchema";
import { toast } from "sonner";
import { ShippingCost } from "@/types/ShippingCost";

export const getShippingCost = async (inputData: GetShippingCostInput) => {
  const parsedResult = GetShippingCostSchema.safeParse(inputData);

  if (!parsedResult.success) {
    const firstError = parsedResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  const { destinationPostCode, originPostCode , weight , itemValue}=inputData
 const params=new URLSearchParams({
    originPostCode,
    destinationPostCode,
    weight  :String(weight),
    itemValue:String(itemValue),
  })

  const data=await apiFetch<ShippingCost>(`/shipping-cost?${params}`, {
    method: "GET",
  });

  return data;
};
