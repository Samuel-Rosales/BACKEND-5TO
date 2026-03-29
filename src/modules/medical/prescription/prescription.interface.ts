export interface CreatePrescriptionDto {
    consultationId: number;
    supplyId?: number;
    medication_name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}

export interface UpdatePrescriptionDto {
    consultationId?: number;
    supplyId?: number;
    medication_name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}
