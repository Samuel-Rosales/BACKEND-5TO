export interface CreatePrescriptionDto {
    consultationId: number;
    productId?: number;
    medication_name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}

export interface UpdatePrescriptionDto {
    consultationId?: number;
    productId?: number;
    medication_name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}
