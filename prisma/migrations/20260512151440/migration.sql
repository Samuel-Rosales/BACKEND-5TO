-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "status" "ConsultationStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "started_at" DROP NOT NULL,
ALTER COLUMN "started_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ExpensePayment" ADD COLUMN     "reference" VARCHAR(255);

-- AlterTable
ALTER TABLE "InvoicePayment" ADD COLUMN     "reference" VARCHAR(255);
