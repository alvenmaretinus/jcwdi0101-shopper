import { apiFetch } from "@/lib/apiFetch";
import { SignupInput, SignupSchema } from "@/schemas/auth/SignupSchema";
import { toast } from "sonner";

export const signupEmail = async (inputData: SignupInput) => {
  const parseResult = SignupSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  await apiFetch("/auth/signup", { method: "POST", body: inputData });
};
