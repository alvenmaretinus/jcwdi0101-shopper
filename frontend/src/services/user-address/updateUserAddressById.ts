import { apiFetch } from "@/lib/apiFetch";
import { UpdateUserAddressInput, UpdateUserAddressSchema } from "@/schemas/user-address/UpdateUserAddressSchema";
import { toast } from "sonner";

export const updateUserAddressById = async (inputData: UpdateUserAddressInput) => {
  const parseResult = UpdateUserAddressSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  await apiFetch(`/user-address/${inputData.id}`, {
    method: "PATCH",
    body: inputData,
  });
};