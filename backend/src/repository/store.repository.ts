import { prisma } from "../lib/db/prisma";
import { Prisma } from "../../prisma/generated/client";
import { storeSelect } from "../select/StoreSelect";
import { userSelect } from "../select/UserSelect";
import { UpdateStoreInput } from "../schema/store/UpdateStoreSchema";

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
      select: { ...storeSelect, employees: { select: userSelect } },
    });
  }

  static async getStores() {
    return await prisma.store.findMany({
      select: { ...storeSelect, _count: { select: { employees: true } } },
    });
  }

  static async updateStore({ id, ...data }: UpdateStoreInput) {
    return await prisma.store.update({
      where: { id },
      data: { ...data },
      select: storeSelect,
    });
  }
}
