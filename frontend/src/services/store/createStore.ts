import { axiosInstance } from "@/lib/axiosInstance";
import { CreateStoreInput } from "@/schemas/store/CreateStoreSchema";
import { Store } from "@/types/Store";

export const createStore = async (inputData: CreateStoreInput) => {
  const res = await axiosInstance.post<Store>("/store", inputData);

  return res.data;
};
