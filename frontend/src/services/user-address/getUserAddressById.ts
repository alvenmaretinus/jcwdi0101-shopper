import { apiFetch } from "@/lib/apiFetch";
import { UserAddress } from "@/types/UserAddress";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { toast } from "sonner";
import z from "zod";

export const getUserAddressById = async ({
  id,
  headers,
}: {
  id: string;
  headers?: ReadonlyHeaders;
}) => {
  const inputData = z.uuid().safeParse(id);
  if (!inputData.success) {
    const firstError = inputData.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid id");
    }
    throw new Error(firstError);
  }
  const result = await apiFetch<UserAddress>(`/user-address/${id}`, {
    method: "GET",
    headers,
  });

  return result;
};
