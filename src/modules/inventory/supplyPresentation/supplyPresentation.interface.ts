export interface CreateSupplyPresentationDto {
    supplyId: number;
    name: string;
    factor: string | number;
    barCode?: string;
    price: string | number;
    isActive?: boolean;
}

export interface UpdateSupplyPresentationDto {
    supplyId?: number;
    name?: string;
    factor?: string | number;
    barCode?: string;
    price?: string | number;
    isActive?: boolean;
}
