export interface CreateExchangeRateDto {
    rate: string | number;
    is_active?: boolean;
}

export interface UpdateExchangeRateDto {
    rate?: string | number;
    is_active?: boolean;
}
