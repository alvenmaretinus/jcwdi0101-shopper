import { prisma } from "../lib/db/prisma";
import { Prisma } from "../../prisma/generated/client";
import { storeSelect } from "../select/store/StoreSelect";

type CreateStoreInput = Omit<
  Prisma.StoreUncheckedCreateInput,
  "employees" | "productStores" | "orders" | "carts"
>;

export class StoreRepository {
  static async createStore(data: CreateStoreInput) {
    return await prisma.store.create({ data, select: storeSelect });
  }

  static async getStoreById(data: { id: string }) {
    return await prisma.store.findUnique({
      where: { id: data.id },
      select: storeSelect,
    });
  }
  static async getStores() {
    return await prisma.store.findMany({
      select: { ...storeSelect, _count: { select: { employees: true } } },
    });
  }
}
