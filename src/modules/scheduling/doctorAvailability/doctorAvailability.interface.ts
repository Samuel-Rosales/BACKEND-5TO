export interface CreateDoctorAvailabilityDto {
    doctorId: number;
    day_of_week: number;
    start_time: string | Date;
    end_time: string | Date;
    patient_limit: number;
}

export interface UpdateDoctorAvailabilityDto {
    doctorId?: number;
    day_of_week?: number;
    start_time?: string | Date;
    end_time?: string | Date;
    patient_limit?: number;
}
