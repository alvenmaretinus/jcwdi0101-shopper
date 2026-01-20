import { axiosInstance } from "@/lib/axiosInstance";
import { UserPayload } from "@/types/Session";

export const getSession = async () => {
  const res = await axiosInstance.get<UserPayload>("/auth/session");

  return res.data;
};
