import { apiFetch } from "@/lib/apiFetch";
import { HttpMethod } from "@/lib/apiFetch";
import { Discount } from "@/types/Discount";
import { toast } from "sonner";

export interface CreateDiscountInput {
  name: string;
  percentage?: number;
  amount?: number;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
  isWithMinimum: boolean;
  minimumPrice?: number;
  hasDiscountAmountCap?: boolean;
  maxDiscountAmount?: number;
  isTiedToProduct: boolean;
  productId?: string;
  buyQuantity?: number;
  freeQuantity?: number;
  startsAt?: Date | string;
  endsAt?: Date | string;
}


export const createDiscount = async (inputData: CreateDiscountInput): Promise<Discount> => {
  try {
    const res = await apiFetch<Discount>("/discounts", {
      method: HttpMethod.POST,
      body: inputData,
    });

    if (typeof window !== "undefined") {
      toast.success("Discount created successfully");
    }

    return res;
  } catch (error: unknown) {
    if (typeof window !== "undefined") {
      toast.error((error as { message: string }).message || "Failed to create discount");
    }
    throw error;
  }
};
