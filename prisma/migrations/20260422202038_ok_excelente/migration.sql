/*
  Warnings:

  - You are about to drop the column `medical_history` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_sangre` on the `Patient` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "medical_history",
DROP COLUMN "tipo_sangre";

-- CreateTable
CREATE TABLE "InfoPatient" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "ci" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "blood_type" TEXT,
    "nacionality" TEXT,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "profession" VARCHAR(100),
    "main_phone" VARCHAR(20),
    "secondary_phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "city" VARCHAR(100),
    "allergies" TEXT,
    "chronic_diseases" TEXT,
    "current_medications" TEXT,
    "previous_surgeries" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InfoPatient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfoPatient_patientId_key" ON "InfoPatient"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "InfoPatient_ci_key" ON "InfoPatient"("ci");

-- AddForeignKey
ALTER TABLE "InfoPatient" ADD CONSTRAINT "InfoPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
