import { StoreRepository } from "../repository/store.repository";
import { CreateStoreInput } from "../schema/store/CreateStoreSchema";

export class StoreService {
  static async createStore(data: CreateStoreInput) {
    const { name, phone, location } = data;
    return await StoreRepository.createStore({
      name,
      phone,
      longitude: location.lng,
      latitude: location.lat,
    });
  }
}
