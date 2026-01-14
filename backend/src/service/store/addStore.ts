import { createStore } from "../../repository/store/createStore";
import { AddStoreInput } from "../../schema/store/AddStoreSchema";

export const addStore = async (data: AddStoreInput) => {
  const { name, phone, location } = data;
  return await createStore({
    name,
    phone,
    longitude: location.lng,
    latitude: location.lat,
  });
};
