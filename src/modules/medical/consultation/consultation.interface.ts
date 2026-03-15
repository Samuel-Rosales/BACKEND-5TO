export interface CreateConsultationDto {
    appointmentId?: number;
    patientId: number;
    doctorId: number;
    date?: string | Date;
    started_at: string | Date;
    finished_at: string | Date;
    symptoms?: string;
    diagnosis?: string;
    physical_exam?: string;
}

export interface UpdateConsultationDto {
    appointmentId?: number;
    patientId?: number;
    doctorId?: number;
    date?: string | Date;
    started_at?: string | Date;
    finished_at?: string | Date;
    symptoms?: string;
    diagnosis?: string;
    physical_exam?: string;
}
