import { prisma } from "../lib/db/prisma";
import { Prisma } from "../../prisma/generated/client";
import { storeSelect } from "../select/StoreSelect";
import { userSelect } from "../select/UserSelect";
import { UpdateStoreInput } from "../schema/store/UpdateStoreSchema";
import { GetStoreByIdInput } from "../schema/store/GetStoreByIdSchema";

type CreateStoreInput = Omit<
  Prisma.StoreUncheckedCreateInput,
  "employees" | "productStores" | "orders" | "carts"
>;

export class StoreRepository {
  static async createStore(data: CreateStoreInput) {
    return await prisma.store.create({ data, select: storeSelect });
  }

  static async getStoreById({ employee, ...data }: GetStoreByIdInput) {
    return await prisma.store.findUnique({
      where: { id: data.id },
      select: {
        ...storeSelect,
        employees: employee ? { select: userSelect } : {},
      },
    });
  }

  static async getStores() {
    return await prisma.store.findMany({
      select: { ...storeSelect, _count: { select: { employees: true } } },
    });
  }

  static async updateStore({ id, coords, ...data }: UpdateStoreInput) {
    return await prisma.store.update({
      where: { id },
      data: { ...data, latitude: coords?.lat, longitude: coords?.lng },
      select: storeSelect,
    });
  }
}
