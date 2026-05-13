import { prisma } from '@/configs';
import { MonthlyRevenueBar, MonthlyRevenuePeriod, MonthlyRevenueQueryRange, MonthlyRevenueResponse } from './monthlyRevenue.interface';

const DAY_MS = 24 * 60 * 60 * 1000;

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const toNumber = (value: unknown): number => {
	const parsed = Number(value ?? 0);
	return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const parseDateOnly = (value: string, isEnd = false): Date => {
	const suffix = isEnd ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
	return new Date(`${value}${suffix}`);
};

const getDefaultRange = (period: MonthlyRevenuePeriod): MonthlyRevenueQueryRange => {
	const now = new Date();

	if (period === 'day') {
		return { from: formatDateOnly(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6))), to: formatDateOnly(now) };
	}

	if (period === 'week') {
		return { from: formatDateOnly(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 27))), to: formatDateOnly(now) };
	}

	if (period === 'year') {
		return { from: formatDateOnly(new Date(Date.UTC(now.getUTCFullYear(), 0, 1))), to: formatDateOnly(now) };
	}

	const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
	const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
	return { from: formatDateOnly(from), to: formatDateOnly(to) };
};

const monthLabel = (date: Date): string =>
	new Intl.DateTimeFormat('es-VE', { month: 'short', timeZone: 'UTC' })
		.format(date)
		.replace('.', '')
		.replace(/^./, (char) => char.toUpperCase());

const dayLabel = (date: Date): string =>
	new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', timeZone: 'UTC' })
		.format(date)
		.replace('.', '')
		.replace(',', '');

const weekStartUTC = (date: Date): Date => {
	const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	const diff = (current.getUTCDay() + 6) % 7;
	current.setUTCDate(current.getUTCDate() - diff);
	return current;
};

const weekLabel = (start: Date): string => {
	const end = new Date(start);
	end.setUTCDate(end.getUTCDate() + 6);
	return `${start.getUTCDate().toString().padStart(2, '0')}/${String(start.getUTCMonth() + 1).padStart(2, '0')} - ${end.getUTCDate().toString().padStart(2, '0')}/${String(end.getUTCMonth() + 1).padStart(2, '0')}`;
};

const isCancelledStatus = (statusName?: string | null): boolean => {
	const status = (statusName ?? '').toLowerCase();
	return status.includes('anulad') || status.includes('cancel');
};

const buildBarKey = (date: Date, period: MonthlyRevenuePeriod) => {
	if (period === 'day') {
		return formatDateOnly(date);
	}

	if (period === 'week') {
		const start = weekStartUTC(date);
		return formatDateOnly(start);
	}

	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const buildBarMeta = (date: Date, period: MonthlyRevenuePeriod) => {
	if (period === 'day') {
		const periodStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
		const periodEnd = new Date(periodStart);
		return { label: dayLabel(date), periodStart, periodEnd };
	}

	if (period === 'week') {
		const periodStart = weekStartUTC(date);
		const periodEnd = new Date(periodStart);
		periodEnd.setUTCDate(periodEnd.getUTCDate() + 6);
		return { label: weekLabel(periodStart), periodStart, periodEnd };
	}

	const periodStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
	const periodEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
	return { label: period === 'year' ? `${monthLabel(date)} ${date.getUTCFullYear()}` : monthLabel(date), periodStart, periodEnd };
};

const buildTimeline = (fromDate: Date, toDate: Date, period: MonthlyRevenuePeriod): Map<string, MonthlyRevenueBar> => {
	const bars = new Map<string, MonthlyRevenueBar>();
	const cursor = new Date(fromDate);

	if (period === 'week') {
		cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() + 6) % 7));
	}

	if (period === 'month' || period === 'year') {
		cursor.setUTCDate(1);
	}

	while (cursor <= toDate) {
		const key = buildBarKey(cursor, period);
		const meta = buildBarMeta(cursor, period);
		bars.set(key, {
			label: meta.label,
			periodStart: meta.periodStart.toISOString(),
			periodEnd: meta.periodEnd.toISOString(),
			incomeUsd: 0,
			consultations: 0,
		});

		if (period === 'day') {
			cursor.setUTCDate(cursor.getUTCDate() + 1);
		} else if (period === 'week') {
			cursor.setUTCDate(cursor.getUTCDate() + 7);
		} else {
			cursor.setUTCMonth(cursor.getUTCMonth() + 1);
		}
	}

	return bars;
};

export class MonthlyRevenueService {
	public static async getMonthlyRevenue(params: Partial<MonthlyRevenueQueryRange> & { period?: MonthlyRevenuePeriod }): Promise<MonthlyRevenueResponse> {
		const period = params.period ?? 'month';
		const resolvedRange = {
			from: params.from || getDefaultRange(period).from,
			to: params.to || getDefaultRange(period).to,
		};

		const fromDate = parseDateOnly(resolvedRange.from);
		const toDate = parseDateOnly(resolvedRange.to, true);
		const timeline = buildTimeline(fromDate, toDate, period);

		const invoices = await prisma.invoice.findMany({
			where: {
				date_at: {
					gte: fromDate,
					lte: toDate,
				},
			},
			include: {
				status: true,
			},
		});

		for (const invoice of invoices) {
			if (isCancelledStatus(invoice.status?.name)) continue;

			const dateAt = invoice.date_at ?? new Date();
			const key = buildBarKey(dateAt, period);
			const bar = timeline.get(key);
			if (!bar) continue;

			bar.incomeUsd = roundMoney(bar.incomeUsd + toNumber(invoice.total_usd));
			bar.consultations += 1;
		}

		return {
			message: 'Reporte de ingresos encontrado exitosamente',
			data: {
				meta: {
					from: resolvedRange.from,
					to: resolvedRange.to,
					period,
				},
				bars: [...timeline.values()],
			},
		};
	}
}
