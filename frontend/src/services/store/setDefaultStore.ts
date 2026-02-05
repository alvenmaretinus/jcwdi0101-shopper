import { apiFetch } from "@/lib/apiFetch";
import {
  SetDefaultStoreInput,
  SetDefaultStoreSchema,
} from "@/schemas/store/SetDefaultStoreSchema";
import { Store } from "@/types/Store";
import { toast } from "sonner";

export const setDefaultStore = async (inputData: SetDefaultStoreInput) => {
  const parseResult = SetDefaultStoreSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  const { id } = inputData;

  const res = await apiFetch<Store>(`/stores/${id}/default`, {
    method: "PATCH",
  });
  return res;
};
