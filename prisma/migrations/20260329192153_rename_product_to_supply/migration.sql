/*
  Warnings:

  - You are about to drop the column `productId` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `StockLot` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `StockMovement` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `SupplyConsultation` table. All the data in the column will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductPresentation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `supplyId` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplyId` to the `StockLot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplyId` to the `StockMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplyId` to the `SupplyConsultation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_productId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_unitId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPresentation" DROP CONSTRAINT "ProductPresentation_productId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "StockLot" DROP CONSTRAINT "StockLot_productId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_productId_fkey";

-- DropForeignKey
ALTER TABLE "SupplyConsultation" DROP CONSTRAINT "SupplyConsultation_productId_fkey";

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "productId",
ADD COLUMN     "supplyId" INTEGER;

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "productId",
ADD COLUMN     "supplyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StockLot" DROP COLUMN "productId",
ADD COLUMN     "supplyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StockMovement" DROP COLUMN "productId",
ADD COLUMN     "supplyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SupplyConsultation" DROP COLUMN "productId",
ADD COLUMN     "supplyId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ProductPresentation";

-- CreateTable
CREATE TABLE "Supply" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "cost_price" DECIMAL(12,2) NOT NULL,
    "min_stock" INTEGER NOT NULL DEFAULT 0,
    "is_perishable" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT,
    "categoryId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,

    CONSTRAINT "Supply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyPresentation" (
    "id" SERIAL NOT NULL,
    "supplyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "factor" DECIMAL(18,6) NOT NULL,
    "barCode" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SupplyPresentation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supply_sku_key" ON "Supply"("sku");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyPresentation" ADD CONSTRAINT "SupplyPresentation_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyConsultation" ADD CONSTRAINT "SupplyConsultation_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
