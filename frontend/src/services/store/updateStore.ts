import { apiFetch } from "@/lib/apiFetch";
import {
  UpdateStoreInput,
  UpdateStoreSchema,
} from "@/schemas/store/UpdateStoreSchema";
import { Store } from "@/types/Store";
import { toast } from "sonner";

export const updateStore = async (inputData: UpdateStoreInput) => {
  const parseResult = UpdateStoreSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  const { id, ...data } = inputData;
  const res = await apiFetch<Store[]>(`/stores/${id}`, {
    method: "PATCH",
    body: data,
  });
  return res;
};
