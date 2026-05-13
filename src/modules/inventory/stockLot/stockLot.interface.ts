export interface CreateStockLotDto {
    quantity: number;
    supplyId: number;
    expiration_date?: string | Date;
    lot_cost: string | number;
}

export interface UpdateStockLotDto {
    quantity?: number;
    supplyId?: number;
    expiration_date?: string | Date;
    lot_cost?: string | number;
}
