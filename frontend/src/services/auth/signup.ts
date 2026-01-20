import { axiosInstance } from "@/lib/axiosInstance";
import { SignupInput, SignupSchema } from "@/schemas/auth/SignupSchema";
import { toast } from "sonner";

export const signup = async (inputData: SignupInput) => {
  const parseResult = SignupSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  await axiosInstance.post("/auth/signup", inputData);
};
