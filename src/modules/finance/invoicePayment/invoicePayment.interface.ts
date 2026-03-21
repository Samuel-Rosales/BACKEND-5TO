export interface CreateInvoicePaymentDto {
    invoiceId: number;
    paymentMethodId: number;
    currencyId: number;
    amount_paid: string | number;
    exchangeRateId?: number;
}

export interface UpdateInvoicePaymentDto {
    paymentMethodId?: number;
    currencyId?: number;
    amount_paid?: string | number;
    exchangeRateId?: number;
}
