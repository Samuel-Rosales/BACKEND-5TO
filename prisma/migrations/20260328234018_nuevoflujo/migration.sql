/*
  Warnings:

  - You are about to drop the column `end_datetime` on the `Appoinment` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentId` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosis` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `physical_exam` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `symptoms` on the `Consultation` table. All the data in the column will be lost.
  - You are about to drop the column `slot_duration` on the `DoctorAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `consultationId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `MeasurementUnit` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the `InvoiceDetail` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[invoiceId]` on the table `Consultation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceId` to the `Consultation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_limit` to the `DoctorAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receptionistId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusPurchase" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'ANULLED');

-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_consultationId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceDetail" DROP CONSTRAINT "InvoiceDetail_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceDetail" DROP CONSTRAINT "InvoiceDetail_productId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceDetail" DROP CONSTRAINT "InvoiceDetail_taxId_fkey";

-- DropIndex
DROP INDEX "Consultation_appointmentId_key";

-- DropIndex
DROP INDEX "Invoice_consultationId_key";

-- AlterTable
ALTER TABLE "Appoinment" DROP COLUMN "end_datetime",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Consultation" DROP COLUMN "appointmentId",
DROP COLUMN "diagnosis",
DROP COLUMN "patientId",
DROP COLUMN "physical_exam",
DROP COLUMN "symptoms",
ADD COLUMN     "invoiceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "DoctorAvailability" DROP COLUMN "slot_duration",
ADD COLUMN     "patient_limit" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "consultationId",
ADD COLUMN     "patientId" INTEGER NOT NULL,
ADD COLUMN     "receptionistId" INTEGER NOT NULL,
ADD COLUMN     "taxId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "MeasurementUnit" DROP COLUMN "is_active",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "last_visit_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "discount",
DROP COLUMN "status",
ADD COLUMN     "status" "StatusPurchase" NOT NULL;

-- DropTable
DROP TABLE "InvoiceDetail";

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_invoiceId_key" ON "Consultation"("invoiceId");

-- CreateIndex
CREATE INDEX "Invoice_patientId_idx" ON "Invoice"("patientId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "Tax"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_receptionistId_fkey" FOREIGN KEY ("receptionistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
