import { axiosInstance } from "@/lib/axiosInstance";
import {
  GetStoreByIdInput,
  GetStoreByIdSchema,
} from "@/schemas/store/GetStoreByIdSchema";
import { User } from "@/types/User";
import { Store } from "@/types/Store";
import { toast } from "sonner";

export const getStoreByIdWithEmployees = async (
  inputData: GetStoreByIdInput
) => {
  const parseResult = GetStoreByIdSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  const res = await axiosInstance.get<Store & { employees: User[] }>(
    `/stores/${inputData.id}/employees`
  );

  return res.data;
};
