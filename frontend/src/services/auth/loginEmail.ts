import { axiosInstance } from "@/lib/axiosInstance";
import { LoginInput, LoginSchema } from "@/schemas/auth/LoginSchema";
import { toast } from "sonner";

export const loginEmail = async (inputData: LoginInput) => {
  const parseResult = LoginSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  await axiosInstance.post("/auth/login", inputData);
};
