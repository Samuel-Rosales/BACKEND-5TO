export interface CreateTaxDto {
    name: string;
    rate: string | number;
    code?: string;
    isActive?: boolean;
}

export interface UpdateTaxDto {
    name?: string;
    rate?: string | number;
    code?: string;
    isActive?: boolean;
}
