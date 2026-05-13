export interface CreateExpensePaymentDto {
    invoiceExpenseId: number;
    paymentMethodId: number;
    amount: string | number;
    exchangeRateId?: number;
    date_at?: string | Date;
}

export interface UpdateExpensePaymentDto {
    invoiceExpenseId?: number;
    paymentMethodId?: number;
    amount?: string | number;
    exchangeRateId?: number;
    date_at?: string | Date;
}
