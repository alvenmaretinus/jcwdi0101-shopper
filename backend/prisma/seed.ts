import { prisma } from "../src/lib/db/prisma";
import { deleteUsers } from "./seeds/deleteUsers";

async function main() {
  await deleteUsers();
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
