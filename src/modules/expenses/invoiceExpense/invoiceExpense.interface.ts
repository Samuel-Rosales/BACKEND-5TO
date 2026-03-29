export interface CreateInvoiceExpenseDto {
    categoryId: number;
    supplierId: number;
    exchangeRateId: number;
    total_amount: number;
    date_at?: string | Date;
    payments: {
        paymentMethodId: number;
        amount: string | number;
        date_at?: string | Date;
    }[];
}

export interface UpdateInvoiceExpenseDto {
    categoryId?: number;
    supplierId?: number;
    exchangeRateId?: number;
    total_amount?: string | number;
    date_at?: string | Date;
}
