import { prisma } from "../../src/lib/db/prisma";
import { UserRole } from "../generated/enums";
import { hashPassword } from "better-auth/crypto";

const ensureCredentialAccount = async (
  userId: string,
  email: string,
  password: string,
) => {
  const existing = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
  });
  if (existing) return existing;

  const hashedPassword = await hashPassword(password);
  return prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: email,
      providerId: "credential",
      userId,
      password: hashedPassword,
    },
  });
};

export async function seedAccounts() {
  console.log("Seeding accounts...");

  const defaultPassword = "Password123!";

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: "Super Admin",
      email: "superadmin@example.com",
      emailVerified: true,
      role: UserRole.SUPERADMIN,
    },
  });
  console.log(`Created super admin: ${superAdmin.email}`);
  await ensureCredentialAccount(
    superAdmin.id,
    superAdmin.email,
    defaultPassword,
  );

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: "Admin",
      email: "admin@example.com",
      emailVerified: true,
      role: UserRole.ADMIN,
      storeId: null, // Admin doesn't belong to a specific store
    },
  });
  console.log(`Created admin: ${admin.email}`);
  await ensureCredentialAccount(admin.id, admin.email, defaultPassword);

  // Create Store Admin
  const storeAdmin = await prisma.user.upsert({
    where: { email: "storeadmin@example.com" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: "Store Admin",
      email: "storeadmin@example.com",
      emailVerified: true,
      role: UserRole.ADMIN,
      storeId: null,
    },
  });
  console.log(`Created store admin: ${storeAdmin.email}`);
  await ensureCredentialAccount(storeAdmin.id, storeAdmin.email, defaultPassword);

  // Create Normal User
  const normalUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: "Normal User",
      email: "user@example.com",
      emailVerified: true,

      role: UserRole.USER,
    },
  });
  console.log(`Created normal user: ${normalUser.email}`);
  await ensureCredentialAccount(
    normalUser.id,
    normalUser.email,
    defaultPassword,
  );

  console.log("Account seeding completed.");
}
