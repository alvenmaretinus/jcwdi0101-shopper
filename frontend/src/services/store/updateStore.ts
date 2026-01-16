import { axiosInstance } from "@/lib/axiosInstance";
import { UpdateStoreInput } from "@/schemas/store/UpdateStoreSchema";
import { Store } from "@/types/Store";

export const updateStore = async ({ id, ...inputData }: UpdateStoreInput) => {
  const res = await axiosInstance.patch<Store[]>(`/stores/${id}`, inputData);

  return res.data;
};
