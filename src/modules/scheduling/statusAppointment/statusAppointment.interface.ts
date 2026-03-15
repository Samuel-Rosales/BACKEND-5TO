export interface CreateStatusAppointmentDto {
    name: string;
    color_hex?: string;
}

export interface UpdateStatusAppointmentDto {
    name?: string;
    color_hex?: string;
}
