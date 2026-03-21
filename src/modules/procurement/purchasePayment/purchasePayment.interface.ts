export interface CreatePurchasePaymentDto {
    purchaseId: number;
    paymentMethodId: number;
    amount: string | number;
    currency?: string;
    reference?: string;
    payment_date?: string | Date;
}

export interface UpdatePurchasePaymentDto {
    purchaseId?: number;
    paymentMethodId?: number;
    amount?: string | number;
    currency?: string;
    reference?: string;
    payment_date?: string | Date;
}
