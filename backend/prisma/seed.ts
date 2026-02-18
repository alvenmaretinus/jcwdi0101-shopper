import { prisma } from "../src/lib/db/prisma";
import { seedAccounts } from "./seeds/seedAccounts";
import { seedProductCategories } from "./seeds/seedProductCategories";
import { seedProducts } from "./seeds/seedProducts";
import { seedStoresWithProducts } from "./seeds/seedStoresWithProducts";
import { seedDiscounts } from "./seeds/seedDiscounts";
import { seedVouchers } from "./seeds/seedVouchers";

async function main() {
  await seedAccounts();
  await seedProductCategories();
  await seedProducts();
  await seedStoresWithProducts();
  await seedDiscounts();
  await seedVouchers();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
