import { Prisma } from "../../prisma/generated/client";

export const userSelect = {
  id: true,
  email: true,
  image: true,
  createdAt: true,
  referralCode: true,
  storeId: true,
  employeeJoinedAt: true,
} as const satisfies Prisma.UserSelect;
