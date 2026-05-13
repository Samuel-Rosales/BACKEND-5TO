export interface CreateSupplierDto {
    name: string;
    contact?: string;
    phone?: string;
}

export interface UpdateSupplierDto {
    name?: string;
    contact?: string;
    phone?: string;
}
