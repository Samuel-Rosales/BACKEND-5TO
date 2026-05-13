export interface CreatePayrollLineDto {
    payrollId: number;
    consultationId: number;
    base_amount: string | number;
    commission_percentage: string | number;
}

export interface UpdatePayrollLineDto {
    payrollId?: number;
    consultationId?: number;
    base_amount?: string | number;
    commission_percentage?: string | number;
}
