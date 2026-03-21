export interface CreatePaymentMethodDto {
    name: string;
    type: string;
    currency: string;
    is_active?: boolean;
}

export interface UpdatePaymentMethodDto {
    name?: string;
    type?: string;
    currency?: string;
    is_active?: boolean;
}
