import { prisma } from "../lib/db/prisma";
import { Prisma } from "../../prisma/generated/client";
import { storeSelect } from "../select/StoreSelect";
import { userSelect } from "../select/UserSelect";
import { GetStoreByIdInput } from "../schema/store/GetStoreByIdSchema";
import { DeleteStoreByIdInput } from "../schema/store/DeleteStoreByIdSchema";

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

  static async getStoreById(id: string) {
    return await prisma.store.findUnique({
      where: { id },
      select: storeSelect,
    });
  }

  static async getStoreByIdWithEmployee(id: string) {
    return await prisma.store.findUnique({
      where: { id },
      select: { ...storeSelect, employees: { select: userSelect } },
    });
  }

  static async getStoreByIdWithCounts(id: string) {
    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            employees: true,
            carts: true,
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
      where: { id },
      data,
      select: storeSelect,
    });
  }

  static async deleteStoreById(data: DeleteStoreByIdInput) {
    return await prisma.store.delete({
      where: { id: data.id },
      select: storeSelect,
    });
  }

  static async getStoresWithEmployeeCount() {
    const stores = await prisma.store.findMany({
      select: { ...storeSelect, _count: { select: { employees: true } } },
    });

    return stores.map(({ _count, ...store }) => ({
      ...store,
      employeeCount: _count.employees,
    }));
  }
}
