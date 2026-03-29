export interface CreateConsultationDto {
    invoiceId: number;
    doctorId: number;
}

export interface UpdateConsultationDto {
    doctorId?: number;
    date?: string | Date;
    started_at?: string | Date;
    finished_at?: string | Date;
    symptoms?: string;
    diagnosis?: string;
    physical_exam?: string;
}
