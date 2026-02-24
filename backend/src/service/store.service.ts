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
import { calculateStackedDiscount } from "../lib/discount/calculateStackedDiscount";

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

type StoreProductWithPricing = StoreProduct & {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
};

export class StoreService {
  static async createStore(data: CreateStoreInput) {
    const { name, phone, coords, addressName, description, postCode } = data;

    const isExist = await prisma.store.findFirst({
      where: { isSoftDeleted: false },
    });
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

  static async getNearestProducts(
    data: GetNearestProductsInput,
  ): Promise<StoreProductWithPricing[]> {
    const limit = data.limit;
    const stores = await StoreRepository.getStoresWithProducts();

    // Sort stores by distance if coordinates provided, otherwise sort by default store
    let sortedStores = stores;
    if (data?.latitude !== undefined && data?.longitude !== undefined) {
      const { latitude, longitude } = data;
      sortedStores = stores.sort((a, b) => {
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
    } else {
      // Sort by default store first when no coordinates provided
      sortedStores = stores.sort((a, b) => {
        if (a.isDefault === b.isDefault) return 0;
        return a.isDefault ? -1 : 1;
      });
    }
    

    const uniqueProductIds = new Set<string>();
    const productMap = new Map<string, StoreProduct>();

    sortedStores.forEach((store) => {
      store.products.forEach((product) => {
        if (product.quantity === 0) return;

        uniqueProductIds.add(product.id);

        const existingProduct = productMap.get(product.id);
        if (!existingProduct) {
          productMap.set(product.id, { ...product });
        } else {
          const currentMaxStock = existingProduct.quantity;
          productMap.set(product.id, {
            ...existingProduct,
            quantity: Math.max(currentMaxStock, product.quantity),
          });
        }
      });
    });

    const uniqueProducts = Array.from(uniqueProductIds)
      .map((id) => productMap.get(id))
      .filter((product) => product !== undefined);

    const nearestProducts = uniqueProducts.slice(0, limit);
    if (nearestProducts.length === 0) return [];

    const now = new Date();
    const productIds = nearestProducts.map((product) => product.id);
    const discounts = await prisma.discount.findMany({
      where: {
        isTiedToProduct: true,
        productId: { in: productIds },
        isSoftDeleted: false,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      select: {
        id: true,
        name: true,
        percentage: true,
        amount: true,
        type: true,
        isVoucher: true,
        isWithMinimum: true,
        minimumPrice: true,
        hasDiscountAmountCap: true,
        maxDiscountAmount: true,
        isQuantityLimited: true,
        maxUses: true,
        useCounter: true,
        isTiedToProduct: true,
        productId: true,
        buyQuantity: true,
        freeQuantity: true,
        startsAt: true,
        endsAt: true,
        isSoftDeleted: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const discountsByProduct = new Map<string, typeof discounts>();
    discounts.forEach((discount) => {
      if (!discount.productId) return;
      const productDiscounts = discountsByProduct.get(discount.productId) ?? [];
      productDiscounts.push(discount);
      discountsByProduct.set(discount.productId, productDiscounts);
    });

    return nearestProducts.map((product) => {
      const productDiscounts = discountsByProduct.get(product.id) ?? [];
      const discountedPricing = calculateStackedDiscount(
        product.price,
        productDiscounts,
      );
      const originalPrice = product.price;
      const finalPrice = discountedPricing.discountedPrice;

      return {
        ...product,
        price: finalPrice,
        originalPrice,
        discountAmount: discountedPricing.totalDiscount,
        finalPrice,
      };
    });
  }

  static async updateStore(data: UpdateStoreInput) {
    const { id, name, lng, lat, description, addressName, phone, postCode } =
      data;
    const store = await StoreRepository.getStoreById({ id });
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

  static async setDefaultStore(data: SetDefaultStoreInput) {
    const { id } = data;
    const store = await StoreRepository.getStoreById({ id });
    if (!store) throw new NotFoundError("Store Not Found");

    const defaultStore = await StoreRepository.getDefaultStore();
    if (!defaultStore) {
      console.error("Default store not found when setting default store");
      throw new AppError({
        message: "Internal Server Error",
        statusCode: 500,
      });
    }

    if (defaultStore.id === id) {
      throw new ConflictError("Store is already the default store");
    }

    return await prisma.$transaction(async (tx) => {
      await tx.store.update({
        where: { id: defaultStore.id },
        data: { isDefault: false },
      });
      return await tx.store.update({
        where: { id },
        data: { isDefault: true },
      });
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

    const defaultStore = await prisma.store.findFirst({
      where: {
        isDefault: true,
        isSoftDeleted: false,
      },
    });
    if (defaultStore?.id === id) {
      throw new ConflictError("Default store cannot be deleted");
    }

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
        { latitude: userAddressLatitude, longitude: userAddressLongitude },
      ),
    }));

    if (radiusMeters && radiusMeters > 0) {
      storesWithDistance = storesWithDistance.filter(
        (store) => store.distance <= radiusMeters,
      );
    }

    const sortedStoreFromNearest = storesWithDistance.sort((a, b) => {
      return a.distance - b.distance;
    });

    return sortedStoreFromNearest;
  }
}
