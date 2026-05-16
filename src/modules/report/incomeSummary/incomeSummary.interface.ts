export interface IncomeSummaryQueryParams {
  from?: string;
  to?: string;
}

export interface IncomeSummaryQueryRange {
  from: string;
  to: string;
}

export interface IncomeSummaryInfo {
  grossIncomeUsd: number;
  collectedUsd: number;
  pendingBalanceUsd: number;
  igtfCollectedUsd: number;
  collectionRate: number;
  averageTicketUsd: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  grossIncomeTrendPct: number;
  collectedTrendPct: number;
  pendingBalanceTrendPct: number;
}

export interface IncomeSummaryBreakdownItem {
  specialtyId: number | null;
  specialty: string;
  consultations: number;
  incomeUsd: number;
  percentage: number;
  averageTicketUsd: number;
}

export interface IncomeSummaryCollectionItem {
  paymentMethodId: number | null;
  paymentMethod: string;
  type: string;
  currency: string;
  payments: number;
  amountUsd: number;
  igtfUsd: number;
  percentage: number;
}

export interface IncomeSummaryReceivableItem {
  invoiceId: number;
  patientName: string;
  specialty: string;
  invoiceDate: string;
  totalUsd: number;
  collectedUsd: number;
  pendingUsd: number;
  daysOutstanding: number;
  status: string;
}

export interface IncomeSummaryAgingBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  count: number;
  amountUsd: number;
}

export interface IncomeSummaryAlert {
  severity: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  invoiceId?: number;
  amountUsd?: number;
}

export interface IncomeSummaryReceivables {
  totalOutstandingUsd: number;
  overdueCount: number;
  averageAgeDays: number;
  agingBuckets: IncomeSummaryAgingBucket[];
  items: IncomeSummaryReceivableItem[];
}

export interface IncomeSummaryMeta {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  periodDays: number;
}

export interface IncomeSummaryResponse {
  message: string;
  data: {
    meta: IncomeSummaryMeta;
    summary: IncomeSummaryInfo;
    breakdownBySpecialty: IncomeSummaryBreakdownItem[];
    collectionByPaymentMethod: IncomeSummaryCollectionItem[];
    receivables: IncomeSummaryReceivables;
    alerts: IncomeSummaryAlert[];
  };
}
