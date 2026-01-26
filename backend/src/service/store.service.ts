import { ConflictError } from "../error/ConflictError";
import { NotFoundError } from "../error/NotFoundError";
import { StoreRepository } from "../repository/store.repository";
import { AddEmployeeInput } from "../schema/store/AddEmployeeSchema";
import { CreateStoreInput } from "../schema/store/CreateStoreSchema";
import { RemoveEmployeeInput } from "../schema/store/RemoveEmployeeSchema";
import { DeleteStoreByIdInput } from "../schema/store/DeleteStoreByIdSchema";
import { GetStoreByIdInput } from "../schema/store/GetStoreByIdSchema";
import { UpdateStoreInput } from "../schema/store/UpdateStoreSchema";
import { GetNearestStoreInput } from "../schema/store/GetNearestStoreSchema";
import { getDistance } from "geolib";

export class StoreService {
  static async createStore(data: CreateStoreInput) {
    const { name, phone, coords, addressName, description, postCode } = data;
    return await StoreRepository.createStore({
      name,
      phone,
      longitude: coords.lng,
      latitude: coords.lat,
      addressName,
      description,
      postCode,
    });
  }

  static async getStoreById(data: GetStoreByIdInput) {
    const { id } = data;
    return await StoreRepository.getStoreById({ id });
  }

  static async getStoreByIdWithEmployee(data: GetStoreByIdInput) {
    const { id } = data;
    return await StoreRepository.getStoreByIdWithEmployee({ id });
  }

  static async getStores() {
    return await StoreRepository.getStoresWithEmployeeCount();
  }

  static async updateStore(data: UpdateStoreInput) {
    const { id, name, lng, lat, description, addressName, phone, postCode } =
      data;
    const store = await StoreRepository.getStoreByIdWithCounts({ id });
    if (!store) throw new NotFoundError("Store Not Found");

    return await StoreRepository.updateStore({
      id,
      name,
      latitude: lat,
      longitude: lng,
      addressName,
      description,
      phone,
      postCode,
    });
  }

  static async deleteStoreById(data: DeleteStoreByIdInput) {
    const { id } = data;
    const store = await StoreRepository.getStoreByIdWithCounts({ id });
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

    return await StoreRepository.deleteStoreById({ id });
  }

  static async addEmployee(data: AddEmployeeInput) {
    const { id, userId } = data;
    const store = await StoreRepository.getStoreByIdWithEmployee({ id });
    if (!store) throw new NotFoundError("Store Not Found");

    const employee = store.employees.find((emp) => emp.id === userId);
    if (employee) throw new NotFoundError("Employee already in this store");

    return await StoreRepository.addEmployeeToStore({ id, userId });
  }

  static async removeEmployee(data: RemoveEmployeeInput) {
    const { id, employeeId } = data;
    const store = await StoreRepository.getStoreByIdWithEmployee({ id });
    if (!store) throw new NotFoundError("Store Not Found");

    const employee = store.employees.find((emp) => emp.id === employeeId);
    if (!employee) throw new NotFoundError("Employee not found in this store");

    return await StoreRepository.removeEmployeeFromStore({
      employeeId,
      id,
    });
  }

  static async getNearestStores(data: GetNearestStoreInput) {
    const {
      latitude: userAddressLatitude,
      longitude: userAddressLongitude,
      radiusMeters,
    } = data;

    const stores = await StoreRepository.getAllStores();
    let storesWithDistance = stores.map((store) => ({
      ...store,
      distance: getDistance(
        { latitude: store.latitude, longitude: store.longitude },
        { latitude: userAddressLatitude, longitude: userAddressLongitude }
      ),
    }));

    if (radiusMeters) {
      storesWithDistance = storesWithDistance.filter(
        (store) => store.distance <= radiusMeters
      );
    }

    const sortedStoreFromNearest = storesWithDistance.sort((a, b) => {
      return a.distance - b.distance;
    });

    return sortedStoreFromNearest;
  }
}
