/*
  Warnings:

  - The `period_end` column on the `DoctorSchedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `period_start` on the `DoctorSchedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DoctorSchedule" DROP COLUMN "period_start",
ADD COLUMN     "period_start" TIMESTAMP NOT NULL,
DROP COLUMN "period_end",
ADD COLUMN     "period_end" TIMESTAMP;

-- CreateIndex
CREATE INDEX "DoctorSchedule_doctorId_period_start_idx" ON "DoctorSchedule"("doctorId", "period_start");

-- CreateIndex
CREATE INDEX "DoctorSchedule_doctorId_period_end_idx" ON "DoctorSchedule"("doctorId", "period_end");
