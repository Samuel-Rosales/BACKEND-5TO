export interface CreateUserDto {
    ci: string;
    name: string;
    password: string;
    roleId: number;
    specialtyId?: number;
}

export interface UpdateUserDto {
    ci?: string;
    name?: string;
    password?: string;
    roleId?: number;
    specialtyId?: number;
}
