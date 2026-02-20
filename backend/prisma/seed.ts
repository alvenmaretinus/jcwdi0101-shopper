import { prisma } from "../src/lib/db/prisma";
import { seedAccounts } from "./seeds/seedAccounts";
import seedDenpasarPanjer from "./seeds/seedDenpasarPanjer";
import { seedProductCategories } from "./seeds/seedProductCategories";
import { seedProducts } from "./seeds/seedProducts";
import { seedStoresWithProducts } from "./seeds/seedStoresWithProducts";
import { seedDiscounts } from "./seeds/seedDiscounts";
import { seedVouchers } from "./seeds/seedVouchers";
import { seedOrders } from "./seeds/seedOrders";

async function main() {
  await seedAccounts();
  // Also seed Denpasar Panjer store + assign admin@example.com
  await seedDenpasarPanjer();
  await seedProductCategories();
  await seedProducts();
  await seedStoresWithProducts();
  await seedDiscounts();
  await seedVouchers();
  await seedOrders();
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
