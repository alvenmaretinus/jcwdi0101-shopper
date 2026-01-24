import { apiFetch } from "@/lib/apiFetch";
import { UserAddress } from "@/types/UserAddress";

export const getUserAddresses = async (headers?: Headers) => {
  const result = await apiFetch<UserAddress[]>("/user-address", {
    headers,
    method: "GET",
  });
  return result;
};
