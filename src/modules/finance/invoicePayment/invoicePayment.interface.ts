export interface CreateInvoicePaymentDto {
    invoiceId: number;
    paymentMethodId: number;
    amount_paid: string | number;
    exchangeRateId?: number;
}

export interface UpdateInvoicePaymentDto {
    paymentMethodId?: number;
    amount_paid?: string | number;
    exchangeRateId?: number;
}
