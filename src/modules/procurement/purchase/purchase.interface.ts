export interface CreatePurchaseItemDto {
    productId: number;
    quantity: number;
    unit_cost: string | number;
    expiration_date?: string | Date;
}

export interface CreatePurchaseDto {
    supplierId: number;
    userId: number;
    exchangeRateId: number;
    status?: string;
    reference?: string;
    observation?: string;
    discount?: string | number;
    items: CreatePurchaseItemDto[];
}

export interface UpdatePurchaseDto {
    supplierId?: number;
    userId?: number;
    exchangeRateId?: number;
    status?: string;
    reference?: string;
    observation?: string;
    discount?: string | number;
}
