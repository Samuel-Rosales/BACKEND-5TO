export interface SpecialtyDemandQueryRange {
	from: string;
	to: string;
}

export interface SpecialtyDemandItem {
	specialtyId: number | null;
	specialty: string;
	consultations: number;
	percentage: number;
}

export interface SpecialtyDemandMeta {
	from: string;
	to: string;
}

export interface SpecialtyDemandResponse {
	message: string;
	data: {
		meta: SpecialtyDemandMeta;
		items: SpecialtyDemandItem[];
	};
}
