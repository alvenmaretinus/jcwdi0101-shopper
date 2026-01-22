import { apiFetch } from "@/lib/apiFetch";
import { LoginInput, LoginSchema } from "@/schemas/auth/LoginSchema";
import { toast } from "sonner";

export const loginEmail = async (inputData: LoginInput) => {
  const parseResult = LoginSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  await apiFetch("/auth/login", { method: "POST", body: inputData });
};
