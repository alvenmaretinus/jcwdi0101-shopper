import { apiFetch } from "@/lib/apiFetch";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export const checkIsOAuth = async (
  headers?: ReadonlyHeaders
): Promise<boolean> => {
  const res = await apiFetch<{ isOAuth: boolean }>("/user/me/is-oauth", {
    method: "GET",
    headers,
  });
  return res.isOAuth;
};
