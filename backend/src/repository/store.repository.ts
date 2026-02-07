import { prisma } from "../lib/db/prisma";
import { Prisma } from "../../prisma/generated/client";
import { RemoveEmployeeInput } from "../schema/store/RemoveEmployeeSchema";
import { AddEmployeeInput } from "../schema/store/AddEmployeeSchema";
import { storeCache } from "../lib/cache/store/storeCache";

type BaseOmit =
  | "employees"
  | "productStores"
  | "orders"
  | "carts"
  | "id"
  | "createdAt"
  | "updatedAt";

type CreateStoreRepo = Omit<Prisma.StoreUncheckedCreateInput, BaseOmit>;

type UpdateStoreRepo = Partial<CreateStoreRepo> & { id: string };

export class StoreRepository {
  static async createStore(data: CreateStoreRepo) {
    await prisma.store.create({ data });

    storeCache.clearAllStores();
  }

  static async getAllStores() {
    const cached = storeCache.getAllStores();
    if (cached) return cached;

    const stores = await prisma.store.findMany({
      where: { isSoftDeleted: false },
    });
    if (stores.length === 0) return [];
    storeCache.setAllStores(stores);

    return stores;
  }

  static async getDefaultStore() {
    const cached = storeCache.getDefaultStore();
    if (cached) return cached;

    const store = await prisma.store.findFirst({
      where: { isDefault: true, isSoftDeleted: false },
    });
    if (store) storeCache.setDefaultStore(store);

    return store;
  }

  static async getStoreById({ id }: { id: string }) {
    const cached = storeCache.getStoreById(id);
    if (cached) return cached;

    const store = await prisma.store.findUnique({
      where: { id, isSoftDeleted: false },
    });
    if (store) storeCache.setStoreById(store);

    return store;
  }

  static async getStoreByIdWithEmployee({ id }: { id: string }) {
    const cached = storeCache.getStoreByIdWithEmployee(id);
    if (cached) return cached;

    const store = await prisma.store.findUnique({
      where: { id, isSoftDeleted: false },
      include: {
        employees: true,
      },
    });
    if (store) storeCache.setStoreByIdWithEmployee(store);

    return store;
  }

  static async getStoresWithProducts() {
    const storesWithProducts = await prisma.store.findMany({
      include: {
        productStores: {
          include: {
            product: {
              include: {
                productImages: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { isDefault: "desc" },
      where: { isSoftDeleted: false },
    });

    const formattedStores = storesWithProducts.map(
      ({ productStores, ...store }) => ({
        ...store,
        products: productStores.map((ps) => ({
          ...ps.product,
          quantity: ps.quantity,
          images: ps.product.productImages.map((pi) => pi.url),
          category: ps.product.category.category,
        })),
      }),
    );

    return formattedStores;
  }

  static async getStoreByIdWithCounts({ id }: { id: string }) {
    const store = await prisma.store.findUnique({
      where: { id, isSoftDeleted: false },
      select: {
        _count: {
          select: {
            employees: true,
            orders: true,
            productStores: true,
          },
        },
      },
    });
    if (store) {
      const { _count } = store;
      return { ..._count };
    }
    return store;
  }

  static async updateStore({ id, ...data }: UpdateStoreRepo) {
    const store = await prisma.store.update({
      where: { id, isSoftDeleted: false },
      data,
    });

    storeCache.clearAllStores();
    storeCache.clearStoreIdWithEmployee(id);
    storeCache.clearStoreId(id);
    if (data.isDefault) storeCache.clearDefaultStore();

    storeCache.setStoreById(store);
    if (data.isDefault) storeCache.setDefaultStore(store);
  }

  static async addEmployeeToStore({ id, userId }: AddEmployeeInput) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "ADMIN",
        employeeJoinedAt: new Date(),
        storeId: id,
      },
    });

    storeCache.clearStoreIdWithEmployee(id);
  }

  static async removeEmployeeFromStore({
    employeeId,
    id,
  }: RemoveEmployeeInput) {
    await prisma.user.update({
      where: { id: employeeId, storeId: id },
      data: {
        role: "USER",
        employeeJoinedAt: null,
        storeId: null,
      },
    });

    storeCache.clearStoreIdWithEmployee(id);
  }

  static async deleteStoreById({ id }: { id: string }) {
    const store = await prisma.store.update({
      where: { id, isSoftDeleted: false },
      data: { isSoftDeleted: true },
    });

    storeCache.clearStoreId(id);

    storeCache.clearStoreIdWithEmployee(id);
    storeCache.clearAllStores();

    if (store.isDefault) storeCache.clearDefaultStore();
  }

  static async getStoresWithEmployeeCount() {
    const stores = await prisma.store.findMany({
      where: { isSoftDeleted: false },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    const storeWithEmployeeCountMapped = stores.map(({ _count, ...store }) => ({
      ...store,
      employeeCount: _count.employees,
    }));

    return storeWithEmployeeCountMapped;
  }
}
