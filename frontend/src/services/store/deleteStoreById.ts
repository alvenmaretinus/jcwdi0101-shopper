import { axiosInstance } from "@/lib/axiosInstance";
import { GetStoreByIdInput } from "@/schemas/store/GetStoreByIdSchema";
import { Store } from "@/types/Store";

export const deleteStoreById = async ({ id }: GetStoreByIdInput) => {
  const res = await axiosInstance.delete<Store>(`/stores/${id}`);

  return res.data;
};
