import { Prisma } from "../../../prisma/generated/client";

export const storeSelect = {
  id: true,
  name: true,
  phone: true,
  longitude: true,
  latitude: true,
  addressName: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.StoreSelect;
