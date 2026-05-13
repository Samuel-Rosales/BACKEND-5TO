export interface ReceptionistPaymentBreakdownItem {
	paymentMethod: {
		id: number;
		name: string;
		type: string;
		currency: string;
		is_active: boolean;
	};
	amount_paid: number;
}

export interface ReceptionistOverviewStats {
	todayAppointments: number;
	todayPatients: number;
	todayPayments: number;
	todayPaymentTransactions: number;
	todayConsultations: number;
}

export interface ReceptionistOverviewResponse {
	message: string;
	data: {
		meta: {
			date: string;
		};
		stats: ReceptionistOverviewStats;
		paymentBreakdown: ReceptionistPaymentBreakdownItem[];
	};
}
