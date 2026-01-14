import { getStoreById } from "../../repository/store/getStoreById";
import { FindStoreByIdInput } from "../../schema/store/FindStoreByIdSchema";

export const findStoreById = async (data: FindStoreByIdInput) => {
  return await getStoreById(data);
};
