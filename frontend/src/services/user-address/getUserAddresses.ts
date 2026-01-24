import { apiFetch } from "@/lib/apiFetch";

export const getUserAddresses = async (headers?: Headers) => {
  const result = await apiFetch("/user-address", { headers, method: "GET" });
  return result;
};
