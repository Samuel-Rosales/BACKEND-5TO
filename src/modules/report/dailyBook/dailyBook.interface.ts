export interface DailyBookQueryRange {
  year: number;
  month: number;
}

export type DailyBookLineType = 'DEBIT' | 'CREDIT';

export interface DailyBookLine {
  date: string;
  entryId: string;
  source: 'INCOME' | 'PURCHASE' | 'OPEX' | 'PAYROLL' | 'SALARY';
  sourceId: number;
  reference: string;
  accountCode: string;
  accountName: string;
  type: DailyBookLineType;
  debit: number;
  credit: number;
  detail: string;
}

export interface DailyBookSummary {
  incomeUsd: number;
  purchasesUsd: number;
  payrollUsd: number;
  salaryUsd: number;
  opexUsd: number;
  totalDebit: number;
  totalCredit: number;
  entriesCount: number;
  linesCount: number;
}
