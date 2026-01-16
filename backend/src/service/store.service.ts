import { StoreRepository } from "../repository/store.repository";
import { CreateStoreInput } from "../schema/store/CreateStoreSchema";
import { GetStoreByIdInput } from "../schema/store/GetStoreByIdSchema";
import { UpdateStoreInput } from "../schema/store/UpdateStoreSchema";

export class StoreService {
  static async createStore(data: CreateStoreInput) {
    const { name, phone, coords, addressName, description } = data;
    return await StoreRepository.createStore({
      name,
      phone,
      longitude: coords.lng,
      latitude: coords.lat,
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

  static async updateStore(data: UpdateStoreInput) {
    return await StoreRepository.updateStore(data);
  }
}
