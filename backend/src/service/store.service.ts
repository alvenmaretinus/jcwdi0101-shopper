import { ConflictError } from "../error/ConflictError";
import { NotFoundError } from "../error/NotFoundError";
import { StoreRepository } from "../repository/store.repository";
import { AddEmployeeInput } from "../schema/store/AddEmployeeSchema";
import { CreateStoreInput } from "../schema/store/CreateStoreSchema";
import { RemoveEmployeeInput } from "../schema/store/RemoveEmployeeSchema";
import { DeleteStoreByIdInput } from "../schema/store/DeleteStoreByIdSchema";
import { GetStoreByIdInput } from "../schema/store/GetStoreByIdSchema";
import { UpdateStoreInput } from "../schema/store/UpdateStoreSchema";
import { SetDefaultStoreInput } from "../schema/store/SetDefaultStoreSchema";
import { GetNearestStoreInput } from "../schema/store/GetNearestStoreSchema";
import { getDistance } from "geolib";
import { GetNearestProductsInput } from "../schema/store/GetNearestProductsSchema";
import { prisma } from "../lib/db/prisma";
import { AppError } from "../error/AppError";
import { GetStoresWithEmployeeCountInput } from "../schema/store/GetStoresWithEmployeeCountSchema";

type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  weight?: number | null;
  category: string;
  images: string[];
  quantity: number;
};

export class StoreService {
  private static async hasAnyStore() {
    const store = await prisma.store.findFirst({
      where: { isSoftDeleted: false },
    });
    return Boolean(store);
  }

  private static sortStoresByDistance(stores: any[], latitude: number, longitude: number) {
    return stores.sort((a, b) => {
      const distA = getDistance(
        { latitude, longitude },
        { latitude: a.latitude, longitude: a.longitude },
      );
      const distB = getDistance(
        { latitude, longitude },
        { latitude: b.latitude, longitude: b.longitude },
      );
      return distA - distB;
    });
  }

  private static sortStoresByDefault(stores: any[]) {
    return stores.sort((a, b) => {
      if (a.isDefault === b.isDefault) return 0;
      return a.isDefault ? -1 : 1;
    });
  }

  private static upsertProductMap(productMap: Map<string, StoreProduct>, product: StoreProduct) {
    const existingProduct = productMap.get(product.id);
    if (!existingProduct) {
      productMap.set(product.id, { ...product });
      return;
    }

    productMap.set(product.id, {
      ...existingProduct,
      quantity: Math.max(existingProduct.quantity, product.quantity),
    });
  }

  private static buildUniqueProductsFromStores(stores: any[]) {
    const uniqueProductIds = new Set<string>();
    const productMap = new Map<string, StoreProduct>();

    stores.forEach((store) => {
      store.products.forEach((product: StoreProduct) => {
        if (product.quantity === 0) return;
        uniqueProductIds.add(product.id);
        this.upsertProductMap(productMap, product);
      });
    });

    return Array.from(uniqueProductIds)
      .map((id) => productMap.get(id))
      .filter((product) => product !== undefined);
  }

  private static async ensureStoreExists(id: string) {
    const store = await StoreRepository.getStoreById({ id });
    if (!store) throw new NotFoundError("Store Not Found");
  }

  private static async getCurrentDefaultStoreOrThrow() {
    const defaultStore = await StoreRepository.getDefaultStore();
    if (defaultStore) return defaultStore;

    console.error("Default store not found when setting default store");
    throw new AppError({
      message: "Internal Server Error",
      statusCode: 500,
    });
  }

  private static async ensureStoreCanBeDeleted(id: string) {
    const store = await StoreRepository.getStoreByIdWithCounts({ id });
    if (!store) throw new NotFoundError("Store Not Found");
    if (store.employees > 0) throw new ConflictError("Employees still exist");
    if (store.orders > 0) throw new ConflictError("Orders still exist");
    if (store.productStores > 0) throw new ConflictError("Products still exist");

    const defaultStore = await prisma.store.findFirst({
      where: {
        isDefault: true,
        isSoftDeleted: false,
      },
    });
    if (defaultStore?.id === id) throw new ConflictError("Default store cannot be deleted");
  }

  private static mapStoresWithDistance(stores: any[], latitude: number, longitude: number) {
    return stores.map((store) => ({
      ...store,
      distance: getDistance(
        { latitude: store.latitude, longitude: store.longitude },
        { latitude, longitude },
      ),
    }));
  }

  private static async swapDefaultStore(currentDefaultStoreId: string, nextDefaultStoreId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.store.update({ where: { id: currentDefaultStoreId }, data: { isDefault: false } });
      return tx.store.update({ where: { id: nextDefaultStoreId }, data: { isDefault: true } });
    });
  }

  private static filterByRadius(storesWithDistance: any[], radiusMeters?: number) {
    if (!radiusMeters || radiusMeters <= 0) return storesWithDistance;
    return storesWithDistance.filter((store) => store.distance <= radiusMeters);
  }

  private static sortByDistance(storesWithDistance: any[]) {
    return storesWithDistance.sort((a, b) => a.distance - b.distance);
  }

  static async createStore(data: CreateStoreInput) {
    const { name, phone, coords, addressName, description, postCode } = data;
    const isExist = await this.hasAnyStore();
    return await StoreRepository.createStore({
      name,
      phone,
      longitude: coords.lng,
      latitude: coords.lat,
      addressName,
      description,
      postCode,
      isDefault: isExist ? false : true,
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

  static async getStoresWithEmployeeCount(
    data: GetStoresWithEmployeeCountInput,
  ) {
    return await StoreRepository.getStoresWithEmployeeCount(data);
  }

  static async getNearestProducts(data?: GetNearestProductsInput) {
    const stores = await StoreRepository.getStoresWithProducts();
    const sortedStores = data?.latitude !== undefined && data?.longitude !== undefined
      ? this.sortStoresByDistance(stores, data.latitude, data.longitude)
      : this.sortStoresByDefault(stores);
    return this.buildUniqueProductsFromStores(sortedStores);
  }

  static async updateStore(data: UpdateStoreInput) {
    const { id, name, lng, lat, description, addressName, phone, postCode } =
      data;
    await this.ensureStoreExists(id);

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

  static async setDefaultStore(data: SetDefaultStoreInput) {
    const { id } = data;
    await this.ensureStoreExists(id);
    const defaultStore = await this.getCurrentDefaultStoreOrThrow();
    if (defaultStore.id === id) throw new ConflictError("Store is already the default store");
    return this.swapDefaultStore(defaultStore.id, id);
  }

  static async deleteStoreById(data: DeleteStoreByIdInput) {
    const { id } = data;
    await this.ensureStoreCanBeDeleted(id);

    return await StoreRepository.deleteStoreById({ id });
  }

  static async addEmployee(data: AddEmployeeInput) {
    const { id, userId } = data;
    const store = await StoreRepository.getStoreByIdWithEmployee({ id });
    if (!store) throw new NotFoundError("Store Not Found");

    const employee = store.employees.find((emp) => emp.id === userId);
    if (employee) throw new ConflictError("Employee already in this store");

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
    const { latitude: userAddressLatitude, longitude: userAddressLongitude, radiusMeters } = data;
    const stores = await StoreRepository.getAllStores();
    const storesWithDistance = this.mapStoresWithDistance(stores, userAddressLatitude, userAddressLongitude);
    const filtered = this.filterByRadius(storesWithDistance, radiusMeters);
    return this.sortByDistance(filtered);
  }
}
