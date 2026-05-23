export interface IncomeStatementQueryRange {
  year: number;
  month: number;
}

export interface IncomeStatementSummary {
  totalRevenueUsd: number;
  totalIgtfUsd: number;
  netRevenueUsd: number;
  totalCogsUsd: number;
  grossProfitUsd: number;
  medicalPayrollUsd: number;
  adminPayrollUsd: number;
  totalPayrollUsd: number;
  opexUsd: number;
  totalExpensesUsd: number;
  netProfitUsd: number;
  invoiceCount: number;
  purchaseCount: number;
  entriesCount: number;
}

export interface IncomeStatementResponse {
  message: string;
  data: {
    period: {
      year: number;
      month: number;
      monthName: string;
    };
    summary: IncomeStatementSummary;
  };
}