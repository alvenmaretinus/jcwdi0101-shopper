import { apiFetch, HttpMethod } from "@/lib/apiFetch";
import { User } from "@/types/User";

export type UpdateUserInput = {
  email?: string;
  role?: "USER" | "ADMIN" | "SUPERADMIN";
  image?: string;
  storeId?: string;
};

export const updateUser = async (userId: string, data: UpdateUserInput) => {
  console.log(data)
  const res = await apiFetch<User>(`/user/${userId}`, {
    method: HttpMethod.PATCH,
    body: data,
  });
  console.log(JSON.stringify(data))

  return res;
};
