import { apiFetch } from "@/lib/apiFetch";
import {
  AddEmployeeInput,
  AddEmployeeSchema,
} from "@/schemas/store/AddEmployeeSchema";
import { User } from "@/types/User";
import { toast } from "sonner";

export const addEmployee = async (inputData: AddEmployeeInput) => {
  const parseResult = AddEmployeeSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  const { id, ...data } = inputData;
  const res = await apiFetch<User>(`/stores/${id}/employees/`, {
    method: "PATCH",
    body: data,
  });

  return res;
};
