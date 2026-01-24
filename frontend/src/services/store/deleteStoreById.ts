import { apiFetch } from "@/lib/apiFetch";
import {
  GetStoreByIdInput,
  GetStoreByIdSchema,
} from "@/schemas/store/GetStoreByIdSchema";
import { Store } from "@/types/Store";
import { toast } from "sonner";

export const deleteStoreById = async (inputData: GetStoreByIdInput) => {
  const parseResult = GetStoreByIdSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  const res = await apiFetch<Store>(`/stores/${inputData.id}`, {
    method: "DELETE",
  });
  return res;
};
