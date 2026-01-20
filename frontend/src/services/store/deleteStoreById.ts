import { axiosInstance } from "@/lib/axiosInstance";
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
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  const res = await axiosInstance.delete<Store>(`/stores/${inputData.id}`);
  return res.data;
};
