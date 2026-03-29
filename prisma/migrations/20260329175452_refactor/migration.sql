/*
  Warnings:

  - You are about to drop the column `igtf_amount` on the `ExpensePayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExpensePayment" DROP COLUMN "igtf_amount",
ALTER COLUMN "date_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceExpense" ALTER COLUMN "date_at" DROP NOT NULL;
