import { prisma } from "../../lib/db/prisma";
import { storeSelect } from "../../select/store/StoreSelect";

export const getStores = async () => {
  return await prisma.store.findMany({
    select: storeSelect,
  });
};
