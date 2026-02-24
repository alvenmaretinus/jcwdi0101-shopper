import { apiFetch } from "@/lib/apiFetch";
import { HttpMethod } from "@/lib/apiFetch";
import { Discount } from "@/types/Discount";
import { toast } from "sonner";

export interface UpdateDiscountInput {
  id: string;
  name?: string;
  percentage?: number;
  amount?: number;
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
  isWithMinimum?: boolean;
  minimumPrice?: number;
  hasDiscountAmountCap?: boolean;
  maxDiscountAmount?: number;
  isTiedToProduct?: boolean;
  productId?: string;
  buyQuantity?: number;
  freeQuantity?: number;
  startsAt?: Date | string;
  endsAt?: Date | string;
}

export const updateDiscount = async (inputData: UpdateDiscountInput): Promise<Discount> => {
  try {
    const { id, ...body } = inputData;
    
    const res = await apiFetch<Discount>(`/discounts/${id}`, {
      method: HttpMethod.PATCH,
      body,
    });

    if (typeof window !== "undefined") {
      toast.success("Discount updated successfully");
    }

    return res;
  } catch (error: unknown) {
    if (typeof window !== "undefined") {
      toast.error((error as { message: string }).message || "Failed to update discount");
    }
    throw error;
  }
};
