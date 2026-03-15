export interface CreateStockMovementDto {
    productId: number;
    stockLotId: number;
    userId: number;
    type: "IN" | "OUT";
    quantity: number;
    reason?: string;
    date?: string | Date;
}

export interface UpdateStockMovementDto {
    productId?: number;
    stockLotId?: number;
    userId?: number;
    type?: "IN" | "OUT";
    quantity?: number;
    reason?: string;
    date?: string | Date;
}
