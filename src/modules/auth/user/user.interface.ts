export interface CreateUserDto {
    ci: string;
    name: string;
    password: string;
    roleId: number;
}

export interface UpdateUserDto {
    ci?: string;
    name?: string;
    password?: string;
    roleId?: number;
}
