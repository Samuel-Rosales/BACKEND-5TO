export interface CreateAppointmentDto {
    doctorId?: number;
    specialtyId?: number;
    patientId: number;
    statusId: number;
    typeId: number;
    reson_visit?: string;
    price: string | number;
    date_time: string | Date;
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
