import { z } from "zod";
import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { User } from "@/types/User";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export const getUserByEmail = async (email: string, headers?: ReadonlyHeaders) => {
  const parsedResult = z.email("Invalid email").safeParse(email);
  if (!parsedResult.success) {
    const firstError = parsedResult.error.issues[0].message;
    throw new Error(firstError);
  }

  const queryParams = new URLSearchParams({
    email,
  });
  const users = await apiFetch<User[]>(`/users?${queryParams}`, {
    method: HttpMethod.GET,
    headers,
  });
  return users[0];
};
