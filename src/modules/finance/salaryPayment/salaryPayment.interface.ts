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

export interface PendingSalaryBreakdownItemDto {
  type: 'PAYROLL_LINE' | 'BASE_SALARY';
  label: string;
  amount: number;
  payrollLineId?: number;
  consultationId?: number;
  invoiceId?: number;
  doctorId?: number;
  doctorName?: string;
  specialtyName?: string;
  baseAmount?: number;
  commissionPercentage?: number;
}

export interface PendingSalarySummaryItemDto {
  userId: number;
  userName: string;
  ci: string;
  roleName: string;
  roleCode: string;
  payrollId: number;
  amount: number;
  type: 'DOCTOR' | 'SALARY';
  breakdown: PendingSalaryBreakdownItemDto[];
}

export interface PendingSalarySummaryResultDto {
  payroll: {
    id: number;
    period_start: Date;
    period_end: Date;
    status: string;
  } | null;
  items: PendingSalarySummaryItemDto[];
  totalAmount: number;
  totalUsers: number;
}
