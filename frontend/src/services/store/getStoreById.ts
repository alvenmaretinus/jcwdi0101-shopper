import { axiosInstance } from "@/lib/axiosInstance";
import { GetStoreByIdInput } from "@/schemas/store/GetStoreByIdSchema";
import { Employee } from "@/types/Employee";
import { Store } from "@/types/Store";

export const getStoreById = async ({ id, employee }: GetStoreByIdInput) => {
  const res = await axiosInstance.get<Store & { employees: Employee[] }>(
    `/store/${id}?employee=${employee}`
  );

  return res.data;
};
