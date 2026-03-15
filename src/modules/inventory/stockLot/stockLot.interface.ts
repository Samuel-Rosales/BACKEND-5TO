export interface CreateStockLotDto {
    quantity: number;
    productId: number;
    expiration_date?: string | Date;
    lot_cost: string | number;
}

export interface UpdateStockLotDto {
    quantity?: number;
    productId?: number;
    expiration_date?: string | Date;
    lot_cost?: string | number;
}
