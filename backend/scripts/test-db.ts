import 'dotenv/config';
import { prisma } from "../src/lib/db/prisma";

async function main() {
  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Prisma connected. Running test query...');
    // Simple raw query; result shape can vary depending on prisma version
    // For Postgres a SELECT 1 will return [{?column?=1}] or similar
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Query result:', result);
  } catch (err) {
    console.error('Database connection or query failed:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
