export interface CreateRoleDto {
  name: string;
  code: string;
}

export interface UpdateRoleDto {
  name?: string;
  code?: string;
}