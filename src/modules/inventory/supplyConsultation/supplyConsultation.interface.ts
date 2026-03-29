export interface CreateSupplyConsultationDto {
    supplyId: number;
    consultationId: number;
    quantity: string | number;
}

export interface UpdateSupplyConsultationDto {
    supplyId?: number;
    consultationId?: number;
    quantity?: string | number;
}
