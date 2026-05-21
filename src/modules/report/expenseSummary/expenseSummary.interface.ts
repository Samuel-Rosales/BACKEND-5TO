export type ExpenseSummaryPeriod = 'day' | 'week' | 'month' | 'year';

export interface ExpenseSummaryQueryRange {
  from: string;
  to: string;
  period?: ExpenseSummaryPeriod;
}

export interface ExpenseSummaryPeriodBucket {
  label: string;
  amountUsd: number;
}

export interface ExpenseSummaryCategoryItem {
  categoryId: number | null;
  category: string;
  amountUsd: number;
  percentage: number;
  breakdown: ExpenseSummaryPeriodBucket[];
}

export interface ExpenseSummarySupplierItem {
  supplierId: number | null;
  supplier: string;
  totalUsd: number;
  paidUsd: number;
  pendingUsd: number;
  invoices: number;
}

export interface ExpenseSummaryPayrollBySpecialtyItem {
  specialtyId: number | null;
  specialty: string;
  employees: number;
  amountUsd: number;
}

export interface ExpenseSummarySalaryByRoleItem {
  roleId: number | null;
  role: string;
  employees: number;
  amountUsd: number;
}

export interface ExpenseSummaryAlert {
  severity: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  amountUsd?: number;
}

export interface ExpenseSummaryInfo {
  totalExpenseUsd: number;
  opexUsd: number;
  purchasesUsd: number;
  payrollUsd: number;
  salaryAdminUsd: number;
  invoiceExpenseCount: number;
  purchaseCount: number;
  payrollDoctorCount: number;
  payrollSalaryCount: number;
  expenseTrendPct: number;
}

export interface ExpenseSummaryResponse {
  message: string;
  data: {
    meta: {
      from: string;
      to: string;
      previousFrom: string;
      previousTo: string;
      periodDays: number;
      period?: ExpenseSummaryPeriod;
    };
    summary: ExpenseSummaryInfo;
    breakdownByCategory: ExpenseSummaryCategoryItem[];
    servicesBySupplier: ExpenseSummarySupplierItem[];
    purchasesByCategory: ExpenseSummaryCategoryItem[];
    payrollBySpecialty: ExpenseSummaryPayrollBySpecialtyItem[];
    salaryByRole: ExpenseSummarySalaryByRoleItem[];
    alerts: ExpenseSummaryAlert[];
  };
}
