export interface CreateDoctorAvailabilityDto {
    doctorScheduleId: number;
    day_of_week: number;
    start_time: string | Date;
    end_time: string | Date;
    patient_limit: number;
}

export interface UpdateDoctorAvailabilityDto {
    doctorScheduleId?: number;
    day_of_week?: number;
    start_time?: string | Date;
    end_time?: string | Date;
    patient_limit?: number;
}
