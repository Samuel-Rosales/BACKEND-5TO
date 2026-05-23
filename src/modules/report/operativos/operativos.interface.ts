export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface ReportQueryRange {
	from?: string;
	to?: string;
	period?: ReportPeriod;
}

export interface ReportMeta {
	from: string;
	to: string;
	period: ReportPeriod;
}

export interface OperativosOverviewSlot {
	slot: string;
	count: number;
	status: 'Normal' | 'Alto' | 'Critico';
}

export interface OperativosOverviewResponse {
	message: string;
	data: {
		meta: ReportMeta;
		stats: {
			scheduledAppointments: number;
			avgAttentionTime: number;
			patientsAttended: number;
			activeDoctors: number;
		};
		periodSummary: {
			activeDoctors: number;
			revenueUsd: number;
			appointments: number;
		};
		occupancyBySlot: OperativosOverviewSlot[];
	};
}

export interface OperativosCitasDay {
	date: string;
	attended: number;
	cancelled: number;
}

export interface OperativosCitasResponse {
	message: string;
	data: {
		meta: ReportMeta;
		stats: {
			totalAppointments: number;
			completedAppointments: number;
			cancelledAppointments: number;
			completionRate: number;
			cancellationRate: number;
		};
		dailyData: OperativosCitasDay[];
	};
}

export interface OperativosTiemposSpecialty {
	area: string;
	consult: number;
	consultations: number;
}

export interface OperativosTiemposResponse {
	message: string;
	data: {
		meta: ReportMeta;
		stats: {
			avgConsultTime: number;
			totalConsultations: number;
			peakHour: string;
			peakHourCount: number;
		};
		bySpecialty: OperativosTiemposSpecialty[];
	};
}

export interface OperativosProductividadDoctor {
	name: string;
	attended: number;
	avgTime: number;
	revenue: number;
}

export interface OperativosProductividadResponse {
	message: string;
	data: {
		meta: ReportMeta;
		stats: {
			doctorsInShift: number;
			avgAttentions: number;
			avgRevenue: number;
		};
		byDoctor: OperativosProductividadDoctor[];
	};
}
