export interface CreateDoctorScheduleDto {
    doctorId: number;
    period_start: string | Date;
    period_end?: string | Date | null;
}

export interface UpdateDoctorScheduleDto {
    doctorId?: number;
    period_start?: string | Date;
    period_end?: string | Date | null;
}
