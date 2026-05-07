export interface GastosQueryParams {
  from: string;
  to: string;
  groupBy?: 'day' | 'week' | 'month';
  currencyView?: 'USD' | 'VES';
}

export interface StatCard {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  color: 'primary' | 'success' | 'warning' | 'danger';
  subText?: string;
}

export interface Alert {
  type: 'warning' | 'danger' | 'info' | 'success';
  message: string;
}

export interface GastosSummaryResponse {
  stats: StatCard[];
  breakdown: Array<{
    category: string;
    amount: number;
    weight: string;
  }>;
  alerts: Alert[];
}

export interface GastosComprasResponse {
  stats: StatCard[];
  table: Array<{
    category: string;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  }>;
}

export interface GastosServiciosResponse {
  stats: StatCard[];
  table: Array<{
    name: string;
    balance: number;
    status: string;
    term: string;
  }>;
}

export interface GastosNominaResponse {
  stats: StatCard[];
  table: Array<{
    group: string;
    amount: number;
    tax: number;
    net: number;
  }>;
}

export interface GastosReportResponse {
  message: string;
  data: GastosSummaryResponse | GastosComprasResponse | GastosServiciosResponse | GastosNominaResponse;
}