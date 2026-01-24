import { apiFetch } from "@/lib/apiFetch";
import {
  RemoveEmployeeInput,
  RemoveEmployeeSchema,
} from "@/schemas/store/RemoveEmployeeSchema";
import { Employee } from "@/types/Employee";
import { toast } from "sonner";

export const removeEmployee = async (inputData: RemoveEmployeeInput) => {
  const parseResult = RemoveEmployeeSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  const { id, employeeId } = inputData;
  const res = await apiFetch<Employee>(
    `/stores/${id}/employees/${employeeId}`,
    {
      method: "DELETE",
    }
  );

  return res;
};
