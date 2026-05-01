export enum ExpenseSource {
  PURCHASE = 'PURCHASE',
  OPEX = 'OPEX',
  PAYROLL = 'PAYROLL',
  ALL = 'ALL'
}

export enum CurrencyView {
  USD = 'USD',
  VES = 'VES'
}

export enum PayrollMode {
  ACCRUED = 'ACCRUED',
  PAID = 'PAID'
}

export interface ExpenseLedgerQueryParams {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  source?: ExpenseSource;
  status?: string;
  currencyView?: CurrencyView;
  page?: number;
  pageSize?: number;
  payrollMode?: PayrollMode;
}

export interface ExpenseLedgerItem {
  id: string; // SOURCE-NUMBER
  source: 'PURCHASE' | 'OPEX' | 'PAYROLL';
  sourceId: number;
  occurredAt: string; // ISO date
  description: string;
  counterparty: string | null;
  category: string | null;
  status: string | null;
  paymentMethod: string | null;
  currencyOriginal: 'USD' | 'VES' | null;
  amountOriginal: number;
  exchangeRate: number | null;
  amountUsd: number;
  amountVes: number;
  notes: string | null;
}

export interface ExpenseLedgerTotals {
  totalUsd: number;
  totalVes: number;
  bySource: {
    PURCHASE: { totalUsd: number; totalVes: number };
    OPEX: { totalUsd: number; totalVes: number };
    PAYROLL: { totalUsd: number; totalVes: number };
  };
}

export interface ExpenseLedgerMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  warnings?: string[];
  filtersApplied: {
    from: string;
    to: string;
    source: string;
    currencyView: string;
    payrollMode: string;
  };
}

export interface ExpenseLedgerResponse {
  message: string;
  data: {
    items: ExpenseLedgerItem[];
    totals: ExpenseLedgerTotals;
    meta: ExpenseLedgerMeta;
  };
}
