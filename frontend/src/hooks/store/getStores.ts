import { axiosInstance } from "@/lib/axiosInstance";
import { Store } from "@/types/Store";

export const getStores = async () => {
  const res = await axiosInstance.get<(Store & { employeeCount: number })[]>(
    "/store"
  );

  return res.data;
};
