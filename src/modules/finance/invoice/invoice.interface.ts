export interface CreateInvoiceDetailDto {
    productId?: number;
    description: string;
    quantity: number;
    unit_price: string | number;
    taxId: number;
    is_commissionable?: boolean;
}

export interface CreateInvoiceDto {
    consultationId: number;
    exchangeRateId?: number;
    statusId?: number;
    details?: CreateInvoiceDetailDto[];
}

export interface UpdateInvoiceDto {
    exchangeRateId?: number;
    statusId?: number;
}
