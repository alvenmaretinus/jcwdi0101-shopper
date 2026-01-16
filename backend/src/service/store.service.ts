import { ConflictError } from "../error/ConflictError";
import { NotFoundError } from "../error/NotFoundError";
import { StoreRepository } from "../repository/store.repository";
import { CreateStoreInput } from "../schema/store/CreateStoreSchema";
import { DeleteStoreByIdInput } from "../schema/store/DeleteStoreByIdSchema";
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
    const { id } = data;
    return await StoreRepository.getStoreById(id);
  }

  static async getStoreByIdWithEmployee(data: GetStoreByIdInput) {
    const { id } = data;
    return await StoreRepository.getStoreByIdWithEmployee(id);
  }

  static async getStores() {
    return await StoreRepository.getStoresWithEmployeeCount();
  }

  static async updateStore(data: UpdateStoreInput) {
    const { id, name, lng, lat, description, addressName, phone } = data;
    const store = await StoreRepository.getStoreByIdWithCounts(id);
    if (!store) throw new NotFoundError("Store Not Found");

    return await StoreRepository.updateStore({
      id,
      name,
      latitude: lat,
      longitude: lng,
      addressName,
      description,
      phone,
    });
  }

  static async deleteStoreById(data: DeleteStoreByIdInput) {
    const { id } = data;
    const store = await StoreRepository.getStoreByIdWithCounts(id);
    if (!store) throw new NotFoundError("Store Not Found");
    if (store.employees > 0) {
      throw new ConflictError("Employees still exist");
    }
    if (store.orders > 0) {
      throw new ConflictError("Orders still exist");
    }
    if (store.productStores > 0) {
      throw new ConflictError("Products still exist");
    }

    return await StoreRepository.deleteStoreById(data);
  }
}
