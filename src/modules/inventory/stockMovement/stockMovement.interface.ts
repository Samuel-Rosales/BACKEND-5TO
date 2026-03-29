export interface CreateStockMovementDto {
    supplyId: number;
    stockLotId: number;
    userId: number;
    type: "IN" | "OUT";
    quantity: number;
    reason?: string;
    date?: string | Date;
}

export interface UpdateStockMovementDto {
    supplyId?: number;
    stockLotId?: number;
    userId?: number;
    type?: "IN" | "OUT";
    quantity?: number;
    reason?: string;
    date?: string | Date;
}
