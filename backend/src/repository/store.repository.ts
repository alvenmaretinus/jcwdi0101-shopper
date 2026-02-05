import { prisma } from "../lib/db/prisma";
import { Prisma } from "../../prisma/generated/client";
import { storeSelect } from "../select/StoreSelect";
import { userSelect } from "../select/UserSelect";
import { RemoveEmployeeInput } from "../schema/store/RemoveEmployeeSchema";
import { AddEmployeeInput } from "../schema/store/AddEmployeeSchema";

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
    return await prisma.store.create({ data, select: storeSelect });
  }

  static async getAllStores() {
    return await prisma.store.findMany({
      select: storeSelect,
      where: { isSoftDeleted: false },
    });
  }

  static async getDefaultStore() {
    return await prisma.store.findFirst({
      where: { isDefault: true, isSoftDeleted: false },
      select: storeSelect,
    });
  }

  static async getStoreById({ id }: { id: string }) {
    return await prisma.store.findUnique({
      where: { id, isSoftDeleted: false },
      select: storeSelect,
    });
  }

  static async getStoreByIdWithEmployee({ id }: { id: string }) {
    return await prisma.store.findUnique({
      where: { id, isSoftDeleted: false },
      select: { ...storeSelect, employees: { select: userSelect } },
    });
  }

  static async getStoresWithProducts() {
    const storesWithProducts = await prisma.store.findMany({
      select: {
        ...storeSelect,
        isSoftDeleted: false,
        productStores: {
          select: {
            quantity: true,
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
    return await prisma.store.update({
      where: { id, isSoftDeleted: false },
      data,
      select: storeSelect,
    });
  }

  static async addEmployeeToStore({ id, userId }: AddEmployeeInput) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        role: "ADMIN",
        employeeJoinedAt: new Date(),
        storeId: id,
      },
    });
  }

  static async removeEmployeeFromStore({
    employeeId,
    id,
  }: RemoveEmployeeInput) {
    return await prisma.user.update({
      where: { id: employeeId, storeId: id },
      data: {
        role: "USER",
        employeeJoinedAt: null,
        storeId: null,
      },
    });
  }

  static async deleteStoreById({ id }: { id: string }) {
    return await prisma.store.update({
      where: { id, isSoftDeleted: false },
      select: storeSelect,
      data: { isSoftDeleted: true },
    });
  }

  static async getStoresWithEmployeeCount() {
    const stores = await prisma.store.findMany({
      select: { ...storeSelect, _count: { select: { employees: true } } },
      where: { isSoftDeleted: false },
    });

    return stores.map(({ _count, ...store }) => ({
      ...store,
      employeeCount: _count.employees,
    }));
  }
}
