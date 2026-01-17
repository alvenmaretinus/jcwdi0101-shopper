import { axiosInstance } from "@/lib/axiosInstance";
import {
  RemoveEmployeeInput,
  RemoveEmployeeSchema,
} from "@/schemas/store/RemoveEmployeeSchema";
import { User } from "@/types/User";
import { toast } from "sonner";

export const removeEmployee = async (inputData: RemoveEmployeeInput) => {
  const parseResult = RemoveEmployeeSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  const { id, employeeId } = inputData;
  const res = await axiosInstance.delete<User>(
    `/stores/${id}/employees/${employeeId}`
  );

  return res.data;
};
