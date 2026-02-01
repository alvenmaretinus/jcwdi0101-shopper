import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";
import { z } from "zod";

export const deleteUserAddressById = async (id: string) => {
  const parseResult = z.uuid().safeParse(id);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  await apiFetch(`/user-address/${id}`, {
    method: "DELETE",
  });
};
