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
export interface DoctorSchedConfigDTO {
    id: number;
    user: {
        id: number;
        ci: string;
        name: string;
    };
    specialty: {
        id: number;
        name: string;
        consultation_price: number;
    };
}