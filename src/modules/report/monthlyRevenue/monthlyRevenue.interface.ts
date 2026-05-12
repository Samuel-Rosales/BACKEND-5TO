export interface MonthlyRevenueQueryParams {
	from?: string;
	to?: string;
	period?: MonthlyRevenuePeriod;
}

export interface MonthlyRevenueQueryRange {
	from: string;
	to: string;
}

export type MonthlyRevenuePeriod = 'day' | 'week' | 'month' | 'year';

export interface MonthlyRevenueBar {
	label: string;
	periodStart: string;
	periodEnd: string;
	incomeUsd: number;
	consultations: number;
}

export interface MonthlyRevenueMeta {
	from: string;
	to: string;
	period: MonthlyRevenuePeriod;
}

export interface MonthlyRevenueResponse {
	message: string;
	data: {
		meta: MonthlyRevenueMeta;
		bars: MonthlyRevenueBar[];
	};
}
