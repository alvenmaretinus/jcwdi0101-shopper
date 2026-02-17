import { prisma } from "../src/lib/db/prisma";
import { seedAccounts } from "./seeds/seedAccounts";
import seedDenpasarPanjer from "./seeds/seedDenpasarPanjer";

async function main() {
  await seedAccounts();
  // Also seed Denpasar Panjer store + assign admin@example.com
  await seedDenpasarPanjer();
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
