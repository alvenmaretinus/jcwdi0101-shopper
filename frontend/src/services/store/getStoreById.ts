import { axiosInstance } from "@/lib/axiosInstance";
import { Employee } from "@/types/Employee";
import { Store } from "@/types/Store";

export const getStoreById = async (id: string) => {
  const res = await axiosInstance.get<Store & { employees: Employee[] }>(
    `/store/${id}`
  );

  return res.data;
};
