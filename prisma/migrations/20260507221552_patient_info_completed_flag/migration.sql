/*
  Warnings:

  - You are about to drop the column `ci` on the `InfoPatient` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `InfoPatient` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `InfoPatient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ci]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "InfoPatient_ci_key";

-- AlterTable
ALTER TABLE "InfoPatient" DROP COLUMN "ci",
DROP COLUMN "last_name",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "info_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_ci_key" ON "Patient"("ci");
