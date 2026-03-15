export interface CreateProductDto {
    name: string;
    sku?: string;
    description?: string;
    cost_price: string | number;
    min_stock?: number;
    active?: boolean;
    categoryId: number;
    unitId: number;
}

export interface UpdateProductDto {
    name?: string;
    sku?: string;
    description?: string;
    cost_price?: string | number;
    min_stock?: number;
    active?: boolean;
    categoryId?: number;
    unitId?: number;
}
