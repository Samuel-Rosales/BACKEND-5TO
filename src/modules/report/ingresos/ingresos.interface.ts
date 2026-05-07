export interface IngresosQueryParams {
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

export interface IngresosSummaryResponse {
  stats: StatCard[];
  breakdown: Array<{
    category: string;
    amount: number;
    weight: string;
  }>;
  alerts: Alert[];
}

export interface IngresosServiciosResponse {
  stats: StatCard[];
  table: Array<{
    codigo: string;
    cuenta: string;
    debe: number;
    haber: number;
    saldo: string;
  }>;
}

export interface IngresosCarteraResponse {
  stats: StatCard[];
  table: Array<{
    ente: string;
    corrente: number;
    vencido: number;
    provision: number;
    total: number;
  }>;
}

export interface IngresosRecaudacionResponse {
  stats: StatCard[];
  table: Array<{
    medio: string;
    sistema: number;
    banco: number;
    dif: number;
    estado: string;
  }>;
}

export interface IngresosReportResponse {
  message: string;
  data: IngresosSummaryResponse | IngresosServiciosResponse | IngresosCarteraResponse | IngresosRecaudacionResponse;
}