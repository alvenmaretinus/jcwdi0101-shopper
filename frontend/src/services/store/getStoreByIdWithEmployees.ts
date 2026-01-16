import { axiosInstance } from "@/lib/axiosInstance";
import { GetStoreByIdInput } from "@/schemas/store/GetStoreByIdSchema";
import { Employee } from "@/types/Employee";
import { Store } from "@/types/Store";

export const getStoreByIdWithEmployees = async ({ id }: GetStoreByIdInput) => {
  const res = await axiosInstance.get<Store & { employees: Employee[] }>(
    `/stores/${id}/employees`
  );

  return res.data;
};
