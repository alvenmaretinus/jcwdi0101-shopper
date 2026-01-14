import { prisma } from "../../lib/db/prisma";

export const getStores = async () => {
  return await prisma.store.findMany();
};
