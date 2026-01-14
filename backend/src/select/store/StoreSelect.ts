import { Prisma } from "../../../prisma/generated/client";

export const storeSelect: Prisma.StoreSelect = {
  id: true,
  name: true,
  phone: true,
  longitude: true,
  latitude: true,
  createdAt: true,
} as const;
