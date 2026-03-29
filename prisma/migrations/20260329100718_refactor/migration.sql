-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
