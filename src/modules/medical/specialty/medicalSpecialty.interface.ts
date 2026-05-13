export interface CreateMedicalSpecialtyDto {
    name: string;
    consultation_price: string | number;
    commission_percentage: string | number;
}

export interface UpdateMedicalSpecialtyDto {
    name?: string;
    consultation_price?: string | number;
    commission_percentage?: string | number;
}
