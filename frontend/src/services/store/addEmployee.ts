import { axiosInstance } from "@/lib/axiosInstance";
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
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  const { id, ...data } = inputData;
  const res = await axiosInstance.patch<User>(`/stores/${id}/employees/`, data);

  return res.data;
};
