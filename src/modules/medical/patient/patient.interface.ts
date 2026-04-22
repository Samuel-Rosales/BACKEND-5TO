export interface CreatePatientDto {
    userId?: number;
    ci?: string;
    name?: string;
    tipo_sangre?: string;
    medical_history?: string;
}

export interface UpdatePatientDto {
    userId?: number;
    ci?: string;
    name?: string;
    tipo_sangre?: string;
    medical_history?: string;
}