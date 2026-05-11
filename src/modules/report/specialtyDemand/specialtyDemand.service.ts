import { prisma } from '@/configs';
import { SpecialtyDemandItem, SpecialtyDemandQueryRange, SpecialtyDemandResponse } from './specialtyDemand.interface';

const DAY_MS = 24 * 60 * 60 * 1000;

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const parseDateOnly = (value: string, isEnd = false): Date => {
	const suffix = isEnd ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
	return new Date(`${value}${suffix}`);
};

const getDefaultRange = (): SpecialtyDemandQueryRange => {
	const now = new Date();
	const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
	return { from: formatDateOnly(from), to: formatDateOnly(now) };
};

export class SpecialtyDemandService {
	public static async getSpecialtyDemand(params: Partial<SpecialtyDemandQueryRange>): Promise<SpecialtyDemandResponse> {
		const resolvedRange = {
			from: params.from || getDefaultRange().from,
			to: params.to || getDefaultRange().to,
		};

		const fromDate = parseDateOnly(resolvedRange.from);
		const toDate = parseDateOnly(resolvedRange.to, true);

		const consultations = await prisma.consultation.findMany({
			where: {
				date: { gte: fromDate, lte: toDate },
			},
			include: {
				doctor: {
					include: {
						specialty: true,
					},
				},
			},
		});

		const itemsMap = new Map<string, SpecialtyDemandItem>();

		for (const consultation of consultations) {
			const specialtyId = consultation.doctor?.specialty?.id ?? null;
			const specialty = consultation.doctor?.specialty?.name ?? 'Sin especialidad';
			const key = `${specialtyId ?? 'null'}-${specialty}`;
			const current = itemsMap.get(key) ?? {
				specialtyId,
				specialty,
				consultations: 0,
				percentage: 0,
			};

			current.consultations += 1;
			itemsMap.set(key, current);
		}

		const total = [...itemsMap.values()].reduce((acc, item) => acc + item.consultations, 0);
		const items = [...itemsMap.values()]
			.map((item) => ({
				...item,
				percentage: roundMoney(total > 0 ? (item.consultations / total) * 100 : 0),
			}))
			.sort((a, b) => b.consultations - a.consultations)
			.slice(0, 5);

		return {
			message: 'Demanda por especialidad encontrada exitosamente',
			data: {
				meta: {
					from: resolvedRange.from,
					to: resolvedRange.to,
				},
				items,
			},
		};
	}
}
