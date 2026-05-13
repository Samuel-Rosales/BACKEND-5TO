export interface CreateSupplyDto {
    name: string;
    sku?: string;
    description?: string;
    cost_price: string | number;
    min_stock?: number;
    active?: boolean;
    categoryId: number;
    unitId: number;
}

export interface UpdateSupplyDto {
    name?: string;
    sku?: string;
    description?: string;
    cost_price?: string | number;
    min_stock?: number;
    active?: boolean;
    categoryId?: number;
    unitId?: number;
}
