/*
  Warnings:

  - You are about to drop the column `addressId` on the `Store` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Store_addressId_key";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "addressId";
