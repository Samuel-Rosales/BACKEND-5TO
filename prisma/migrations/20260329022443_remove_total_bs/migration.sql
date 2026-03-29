/*
  Warnings:

  - You are about to drop the column `total_bs` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the `Appoinment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appoinment" DROP CONSTRAINT "Appoinment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Appoinment" DROP CONSTRAINT "Appoinment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Appoinment" DROP CONSTRAINT "Appoinment_statusId_fkey";

-- DropForeignKey
ALTER TABLE "Appoinment" DROP CONSTRAINT "Appoinment_typeId_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "total_bs";

-- DropTable
DROP TABLE "Appoinment";

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "reson_visit" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "StatusAppointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AppointmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
