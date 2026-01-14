import { StoreUncheckedCreateInput } from "../../../prisma/generated/models";
import { prisma } from "../../lib/db/prisma";
import { storeSelect } from "../../select/store/StoreSelect";

type CreateStoreInput = Omit<
  StoreUncheckedCreateInput,
  "employees" | "productStores" | "orders" | "carts"
>;

export const createStore = async (data: CreateStoreInput) => {
  return await prisma.store.create({ data, select: storeSelect });
};
