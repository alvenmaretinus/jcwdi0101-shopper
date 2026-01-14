import { prisma } from "../lib/db/prisma";
import { Prisma } from "../../prisma/generated/client";

type CreateStoreInput = Omit<
  Prisma.StoreUncheckedCreateInput,
  "employees" | "productStores" | "orders" | "carts"
>;

export class StoreRepository {
  static async createStore(data: CreateStoreInput) {
    return await prisma.store.create({ data });
  }
}
