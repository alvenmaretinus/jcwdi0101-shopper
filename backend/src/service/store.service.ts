import { StoreRepository } from "../repository/store.repository";
import { CreateStoreInput } from "../schema/store/CreateStoreSchema";
import { GetStoreByIdInput } from "../schema/store/GetStoreByIdSchema";

export class StoreService {
  static async createStore(data: CreateStoreInput) {
    const { name, phone, location, addressName, description } = data;
    return await StoreRepository.createStore({
      name,
      phone,
      longitude: location.lng,
      latitude: location.lat,
      addressName,
      description,
    });
  }

  static async getStoreById(data: GetStoreByIdInput) {
    return await StoreRepository.getStoreById(data);
  }

  static async getStores() {
    return await StoreRepository.getStores();
  }
}
