import { apiFetch } from "@/lib/apiFetch";
import { User } from "@/types/User";

type GetUsersParams = {
  email?: string;
  role?: "USER" | "ADMIN" | "SUPERADMIN";
  storeId?: string;
  referralCode?: string;
};

export const getUsers = async (params?: GetUsersParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.email) queryParams.append("email", params.email);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.storeId) queryParams.append("storeId", params.storeId);
  if (params?.referralCode) queryParams.append("referralCode", params.referralCode);

  const queryString = queryParams.toString();
  const url = queryString ? `/users?${queryString}` : "/users";
  
  const res = await apiFetch<User[]>(url, {
    method: "GET",
  });
  
  return res;
};
