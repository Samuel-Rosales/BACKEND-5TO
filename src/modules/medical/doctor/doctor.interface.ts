export interface CreateDoctorDto {
    userId: number;
    specialtyId: number;
}

export interface UpdateDoctorDto {
    userId?: number;
    specialtyId?: number;
}
