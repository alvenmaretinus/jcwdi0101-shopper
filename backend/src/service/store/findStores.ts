import { getStores } from "../../repository/store/getStores";

export const findStores = async () => {
  return await getStores();
};
