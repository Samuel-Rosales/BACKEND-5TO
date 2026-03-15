export interface CreateMeasurementUnitDto {
    name: string;
    symbol: string;
}

export interface UpdateMeasurementUnitDto {
    name?: string;
    symbol?: string;
}
