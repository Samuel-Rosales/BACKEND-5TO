/*
  Warnings:

  - You are about to drop the column `currencyId` on the `InvoicePayment` table. All the data in the column will be lost.
  - The `currency` column on the `PaymentMethod` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'VES');

-- AlterTable
ALTER TABLE "InvoicePayment" DROP COLUMN "currencyId";

-- AlterTable
ALTER TABLE "PaymentMethod" DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';
