export interface CreatePatientDto {
    userId: number;
    ci?: string;
    name?: string;
}

export interface CreatePatientFromReceptionDto {
    ci: string;
    name: string;
}

export interface UpdatePatientDto {
    userId?: number;
    ci?: string;
    name?: string;
}
