/*
  Warnings:

  - You are about to drop the column `total_cost` on the `Purchase` table. All the data in the column will be lost.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Consultation" ALTER COLUMN "started_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "finished_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MeasurementUnit" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "is_perishable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "total_cost",
ADD COLUMN     "conditions" TEXT,
ADD COLUMN     "discount" DECIMAL(12,2),
ADD COLUMN     "observation" TEXT,
ADD COLUMN     "payment_due_date" TIMESTAMP(3),
ADD COLUMN     "payment_status" INTEGER,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "remaining_balance" DECIMAL(12,2),
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "PurchaseItem" ADD COLUMN     "expiration_date" DATE;

-- AlterTable
ALTER TABLE "PurchasePayment" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "payment_date" TIMESTAMP(3),
ADD COLUMN     "reference" TEXT;

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "Symptoms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomsConsultas" (
    "id" SERIAL NOT NULL,
    "symptoms_id" INTEGER NOT NULL,
    "consultation_id" INTEGER NOT NULL,
    "severity" VARCHAR(50) NOT NULL,
    "duration" VARCHAR(100) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SymptomsConsultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalExamination" (
    "id" SERIAL NOT NULL,
    "consultation_id" INTEGER NOT NULL,
    "weight" DECIMAL(10,2),
    "height" DECIMAL(10,2),
    "temperature" DECIMAL(10,2),
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "heart_rate" INTEGER,
    "respiratory_rate" INTEGER,
    "oxygen_saturation" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalExamination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(255) NOT NULL,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationDiagnosis" (
    "id" SERIAL NOT NULL,
    "consultation_id" INTEGER NOT NULL,
    "diagnosisId" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "condition_status" VARCHAR(50),
    "onset_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_code_key" ON "Diagnosis"("code");

-- AddForeignKey
ALTER TABLE "SymptomsConsultas" ADD CONSTRAINT "SymptomsConsultas_symptoms_id_fkey" FOREIGN KEY ("symptoms_id") REFERENCES "Symptoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomsConsultas" ADD CONSTRAINT "SymptomsConsultas_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalExamination" ADD CONSTRAINT "ClinicalExamination_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationDiagnosis" ADD CONSTRAINT "ConsultationDiagnosis_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationDiagnosis" ADD CONSTRAINT "ConsultationDiagnosis_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
