-- CreateTable
CREATE TABLE "PayrollPayment" (
    "id" SERIAL NOT NULL,
    "salaryPaymentId" INTEGER NOT NULL,
    "payrollLineId" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PayrollPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayrollPayment_salaryPaymentId_idx" ON "PayrollPayment"("salaryPaymentId");

-- CreateIndex
CREATE INDEX "PayrollPayment_payrollLineId_idx" ON "PayrollPayment"("payrollLineId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPayment_salaryPaymentId_payrollLineId_key" ON "PayrollPayment"("salaryPaymentId", "payrollLineId");

-- AddForeignKey
ALTER TABLE "PayrollPayment" ADD CONSTRAINT "PayrollPayment_salaryPaymentId_fkey" FOREIGN KEY ("salaryPaymentId") REFERENCES "SalaryPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollPayment" ADD CONSTRAINT "PayrollPayment_payrollLineId_fkey" FOREIGN KEY ("payrollLineId") REFERENCES "PayrollLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
