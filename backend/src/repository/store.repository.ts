import { prisma } from "../lib/db/prisma";
import { Prisma } from "../../prisma/generated/client";

type CreateStoreInput = Omit<
  Prisma.StoreUncheckedCreateInput,
  "employees" | "productStores" | "orders" | "carts"
>;

// TODO: make return dto

export class StoreRepository {
  static async createStore(data: CreateStoreInput) {
    return await prisma.store.create({ data });
  }

  static async getStoreById(data: { id: string }) {
    return await prisma.store.findUnique({ where: { id: data.id } });
  }
  static async getStores() {
    return await prisma.store.findMany();
  }
}
