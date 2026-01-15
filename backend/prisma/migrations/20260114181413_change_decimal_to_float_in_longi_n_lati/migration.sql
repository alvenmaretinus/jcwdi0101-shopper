/*
  Warnings:

  - You are about to alter the column `longitude` on the `Store` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,5)` to `DoublePrecision`.
  - You are about to alter the column `latitude` on the `Store` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,5)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "longitude" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "latitude" SET DATA TYPE DOUBLE PRECISION;
