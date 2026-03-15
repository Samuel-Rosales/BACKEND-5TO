export interface CreateAppointmentDto {
    doctorId: number;
    patientId: number;
    statusId: number;
    typeId: number;
    reson_visit?: string;
    price: string | number;
    start_datetime: string | Date;
    end_datetime: string | Date;
}

export interface UpdateAppointmentDto {
    doctorId?: number;
    patientId?: number;
    statusId?: number;
    typeId?: number;
    reson_visit?: string;
    price?: string | number;
    start_datetime?: string | Date;
    end_datetime?: string | Date;
}
