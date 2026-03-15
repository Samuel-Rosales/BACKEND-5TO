export interface CreateSupplyConsultationDto {
    productId: number;
    consultationId: number;
    quantity: string | number;
}

export interface UpdateSupplyConsultationDto {
    productId?: number;
    consultationId?: number;
    quantity?: string | number;
}
