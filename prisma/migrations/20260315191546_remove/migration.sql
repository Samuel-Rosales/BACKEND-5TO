/*
  Warnings:

  - You are about to drop the column `is_active` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `ProductPresentation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductPresentation" DROP CONSTRAINT "ProductPresentation_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "is_active",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "ProductPresentation";
