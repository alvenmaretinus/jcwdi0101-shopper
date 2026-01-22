import { apiFetch } from "@/lib/apiFetch";
import {
  CreateStoreInput,
  CreateStoreSchema,
} from "@/schemas/store/CreateStoreSchema";
import { Store } from "@/types/Store";
import { toast } from "sonner";

export const createStore = async (inputData: CreateStoreInput) => {
  const parseResult = CreateStoreSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  const res = await apiFetch<Store>("/stores", {
    method: "POST",
    body: inputData,
  });
  return res;
};
