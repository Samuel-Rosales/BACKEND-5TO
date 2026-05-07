export interface CreatePatientDto {
    userId?: number;
    ci?: string;
    name?: string;
    infoPatient?: CreateInfoPatientDto;
}

export interface UpdatePatientDto {
    userId?: number;
    ci?: string;
    name?: string;
}

export interface CreateInfoPatientDto {
    ci: string;
    name: string;
    last_name: string;
    sex: 'MALE' | 'FEMALE';
    birth_date: string;
    blood_type?: string;
    nacionality?: string;
    profession?: string;
    main_phone?: string;
    secondary_phone?: string;
    email?: string;
    address?: string;
    city?: string;
    allergies?: string;
    chronic_diseases?: string;
    current_medications?: string;
    previous_surgeries?: string;
}

export interface UpdateInfoPatientDto {
    main_phone?: string;
    secondary_phone?: string;
    email?: string;
    address?: string;
    city?: string;
}

export interface PatientSearchParams {
    ci?: string;
    name?: string;
    page?: number;
    limit?: number;
    userId?: number;
}