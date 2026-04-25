export interface CreatePayrollDto {
    period_start: string | Date;
    period_end: string | Date;
    status?: string;
}

export interface UpdatePayrollDto {
    period_start?: string | Date;
    period_end?: string | Date;
    status?: string;
}
