-- DropIndex
DROP INDEX "Patient_userId_key";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "ci" TEXT,
ADD COLUMN     "name" TEXT;
