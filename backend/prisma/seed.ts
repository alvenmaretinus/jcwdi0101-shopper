import { prisma } from "../src/lib/db/prisma";
import { seedAccounts } from "./seeds/seedAccounts";

async function main() {
  await seedAccounts();
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
