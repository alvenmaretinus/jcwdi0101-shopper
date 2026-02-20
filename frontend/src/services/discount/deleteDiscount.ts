import { apiFetch } from "@/lib/apiFetch";
import { HttpMethod } from "@/lib/apiFetch";
import { toast } from "sonner";

export const deleteDiscount = async (id: string): Promise<void> => {
  try {
    await apiFetch<void>(`/discounts/${id}`, {
      method: HttpMethod.DELETE,
    });

    if (typeof window !== "undefined") {
      toast.success("Discount deleted successfully");
    }
  } catch (error: unknown) {
    if (typeof window !== "undefined") {
      toast.error((error as { message: string }).message || "Failed to delete discount");
    }
    throw error;
  }
};
