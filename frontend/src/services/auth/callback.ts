import { apiFetch } from "@/lib/apiFetch";
import { CallbackInput, CallbackSchema } from "@/schemas/auth/CallbackSchema";
import { toast } from "sonner";

export const callback = async (inputData: CallbackInput) => {
  const parseResult = CallbackSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }
  return await apiFetch("/auth/callback", {
    method: "POST",
    body: inputData,
  });
};
