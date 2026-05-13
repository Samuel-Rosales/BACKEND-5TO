export interface CreateDiagnosisDto {
    code: string;
    description: string;
    category: string;
}

export interface UpdateDiagnosisDto {
    code?: string;
    description?: string;
    category?: string;
}
