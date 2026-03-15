export interface CreateDoctorScheduleOverrideDto {
    doctorId: number;
    specific_date: string | Date;
    is_working?: boolean;
    start_time?: string | Date;
    end_time?: string | Date;
    reason?: string;
}

export interface UpdateDoctorScheduleOverrideDto {
    doctorId?: number;
    specific_date?: string | Date;
    is_working?: boolean;
    start_time?: string | Date;
    end_time?: string | Date;
    reason?: string;
}
