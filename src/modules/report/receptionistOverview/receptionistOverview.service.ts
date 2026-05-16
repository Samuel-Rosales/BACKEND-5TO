import { prisma } from '@/configs';
import { ReceptionistOverviewResponse, ReceptionistPaymentBreakdownItem } from './receptionistOverview.interface';

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const startOfUtcDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
const endOfUtcDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

const paymentSelect = {
	id: true,
	name: true,
	type: true,
	currency: true,
	is_active: true,
} as const;

export class ReceptionistOverviewService {
	public static async getOverview(): Promise<ReceptionistOverviewResponse> {
		const now = new Date();
		const from = startOfUtcDay(now);
		const to = endOfUtcDay(now);

		const [todayAppointments, todayPatients, todayConsultations, payments] = await Promise.all([
			prisma.appointment.count({
				where: { date_time: { gte: from, lte: to } },
			}),
			prisma.patient.count({
				where: { createdAt: { gte: from, lte: to } },
			}),
			prisma.consultation.count({
				where: {
					date: { gte: from, lte: to },
					status: 'FINISHED',
				},
			}),
			prisma.invoicePayment.findMany({
				where: { date_at: { gte: from, lte: to } },
				select: {
					amount_paid: true,
					paymentMethod: { select: paymentSelect },
				},
			}),
		]);

		const paymentMap = new Map<number, ReceptionistPaymentBreakdownItem>();

		for (const payment of payments) {
			const methodId = payment.paymentMethod.id;
			const current = paymentMap.get(methodId) ?? {
				paymentMethod: payment.paymentMethod,
				amount_paid: 0,
			};

			current.amount_paid = roundMoney(current.amount_paid + Number(payment.amount_paid));
			paymentMap.set(methodId, current);
		}

		const paymentBreakdown = [...paymentMap.values()].sort((a, b) => b.amount_paid - a.amount_paid);
		const todayPayments = roundMoney(paymentBreakdown.reduce((sum, item) => sum + item.amount_paid, 0));

		return {
			message: 'Resumen de recepción encontrado exitosamente',
			data: {
				meta: {
					date: now.toISOString().slice(0, 10),
				},
				stats: {
					todayAppointments,
					todayPatients,
					todayPayments,
					todayPaymentTransactions: payments.length,
					todayConsultations,
				},
				paymentBreakdown,
			},
		};
	}
}
