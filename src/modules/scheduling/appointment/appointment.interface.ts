export interface CreateAppointmentDto {
    doctorId?: number;
    specialtyId?: number;
    patientId: number;
    statusId: number;
    typeId: number;
    reson_visit?: string;
    price: string | number;
    date_time: string | Date;
    payment_method?: string;
    reference?: string;
}

export interface UpdateAppointmentDto {
    doctorId?: number;
    specialtyId?: number;
    patientId?: number;
    statusId?: number;
    typeId?: number;
    reson_visit?: string;
    price?: string | number;
    date_time?: string | Date;
}
