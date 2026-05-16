export interface CreateInvoicePaymentDto {
    invoiceId: number;
    paymentMethodId: number;
    amount_paid: string | number;
    exchangeRateId?: number;
    reference?: string;
}

export interface UpdateInvoicePaymentDto {
    paymentMethodId?: number;
    amount_paid?: string | number;
    exchangeRateId?: number;
    reference?: string;
}
