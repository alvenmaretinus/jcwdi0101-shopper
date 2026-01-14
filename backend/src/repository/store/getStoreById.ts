import { storeSelect } from "../../select/store/StoreSelect";
import { prisma } from "../../lib/db/prisma";

export const getStoreById = async (data: { id: string }) => {
  return await prisma.store.findUnique({
    where: { id: data.id },
    select: storeSelect,
  });
};
