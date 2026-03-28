export interface CreatePatientDto {
    userId?: number;
}

export interface UpdatePatientDto {
    userId?: number;
    tipo_sangre?: string;
    medical_history?: string;
}