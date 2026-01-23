import { apiFetch } from "@/lib/apiFetch";
import {
  GetStoreByIdInput,
  GetStoreByIdSchema,
} from "@/schemas/store/GetStoreByIdSchema";
import { Employee } from "@/types/Employee";
import { Store } from "@/types/Store";
import { toast } from "sonner";

export const getStoreByIdWithEmployees = async (
  inputData: GetStoreByIdInput
) => {
  const parseResult = GetStoreByIdSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  const res = await apiFetch<Store & { employees: Employee[] }>(
    `/stores/${inputData.id}/employees`,
    { method: "GET" }
  );

  return res;
};
