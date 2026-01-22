import { apiFetch } from "@/lib/apiFetch";
import { UserPayload } from "@/types/Session";

export const getSession = async () => {
  try {
    const res = await apiFetch<UserPayload>("/auth/session", { method: "GET" });

    return res;
  } catch (error) {
    return null;
  }
};
