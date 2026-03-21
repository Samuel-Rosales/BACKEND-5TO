/*
  Warnings:

  - You are about to drop the column `payment_due_date` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `remaining_balance` on the `Purchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "payment_due_date",
DROP COLUMN "payment_status",
DROP COLUMN "remaining_balance";

-- CreateTable
CREATE TABLE "ProductPresentation" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "factor" DECIMAL(18,6) NOT NULL,
    "barCode" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductPresentation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductPresentation" ADD CONSTRAINT "ProductPresentation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
