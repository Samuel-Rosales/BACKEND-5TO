export interface CreateSalaryPaymentDto {
  payrollId: number | string;
  userId: number | string;
  amount?: number | string;
  concept?: string;
  date_at?: string | Date;
}

export interface UpdateSalaryPaymentDto {
  payrollId?: number | string;
  userId?: number | string;
  amount?: number | string;
  concept?: string;
  date_at?: string | Date;
}
