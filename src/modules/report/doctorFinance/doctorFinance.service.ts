import { prisma } from "@/configs";
import { resolveExchangeRate } from "@/utils/exchange-rate.util";
import {
  DoctorFinanceQuery,
  DoctorFinanceResponse,
  DoctorFinanceMonthlyData,
  DoctorFinanceRevenueSource,
  DoctorFinanceTransaction,
} from "./doctorFinance.interface";

const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const parseDateOnly = (value: string, isEnd = false): Date => {
  const suffix = isEnd ? "T23:59:59.999Z" : "T00:00:00.000Z";
  return new Date(`${value}${suffix}`);
};

const getDefaultRange = (): { from: string; to: string } => {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  return { from: formatDateOnly(from), to: formatDateOnly(now) };
};

const formatMonthLabel = (date: Date): string =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), 1).toLocaleDateString("es-VE", {
    month: "short",
  });

const money = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const computeDoctorLineAmount = (baseAmount: number, commissionPercentage: number) =>
  money(baseAmount * (commissionPercentage / 100));

export class DoctorFinanceService {
  public static async getReport(
    doctorUserId: number,
    params: DoctorFinanceQuery,
  ): Promise<DoctorFinanceResponse> {
    const defaults = getDefaultRange();
    const from = params.from ?? defaults.from;
    const to = params.to ?? defaults.to;
    const fromDate = parseDateOnly(from);
    const toDate = parseDateOnly(to, true);

    const doctor = await prisma.doctor.findUnique({
      where: { userId: doctorUserId },
      select: {
        id: true,
        specialty: { select: { commission_percentage: true } },
      },
    });

    const activeRate = await resolveExchangeRate();
    const exchangeRate = Number(activeRate.rate) || 1;

    if (!doctor) {
      return {
        message: "Doctor no encontrado",
        data: {
          meta: { from, to },
          stats: {
            totalRevenue: 0,
            totalExpenses: 0,
          netProfit: 0,
          doctorEarnings: 0,
          doctorCommission: 0,
        },
          monthlyData: [],
          revenueSources: [],
          recentTransactions: [],
          exchangeRate,
        },
      };
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId: doctor.id,
        invoice: { date_at: { gte: fromDate, lte: toDate } },
      },
      include: {
        invoice: { select: { id: true, total_usd: true, date_at: true } },
        doctor: { select: { id: true } },
        prescriptions: false,
      },
      orderBy: { invoice: { date_at: "desc" } },
    });

    const monthlyMap = new Map<string, DoctorFinanceMonthlyData>();
    const revenueSourcesMap = new Map<string, DoctorFinanceRevenueSource>();
    const transactions: DoctorFinanceTransaction[] = [];

    let totalRevenue = 0;
    let doctorEarnings = 0;
    const doctorCommission = Number(doctor.specialty?.commission_percentage ?? 0);

    for (const consultation of consultations) {
      if (!consultation.invoice?.date_at) continue;
      const date = consultation.invoice.date_at;
      const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
      const monthLabel = formatMonthLabel(date);
      const revenue = Number(consultation.invoice.total_usd ?? 0);
      const earning = computeDoctorLineAmount(revenue, doctorCommission);
      totalRevenue += revenue;
      doctorEarnings += earning;

      const monthly =
        monthlyMap.get(monthKey) ??
        ({
          month: monthLabel,
          revenue: 0,
          expenses: 0,
          profit: 0,
          doctorEarnings: 0,
        } satisfies DoctorFinanceMonthlyData);
      monthly.revenue += revenue;
      monthly.doctorEarnings += earning;
      monthlyMap.set(monthKey, monthly);

      const sourceName = "Consultas";
      const source = revenueSourcesMap.get(sourceName) ?? { source: sourceName, amount: 0 };
      source.amount += revenue;
      revenueSourcesMap.set(sourceName, source);

      transactions.push({
        id: consultation.invoice.id,
        description: "Consulta médica",
        category: "Consulta",
        type: "income",
        amount: earning,
        date: formatDateOnly(date),
      });
    }

    const fromYear = fromDate.getUTCFullYear();
    const fromMonth = fromDate.getUTCMonth();
    const toYear = toDate.getUTCFullYear();
    const toMonth = toDate.getUTCMonth();
    for (let year = fromYear; year <= toYear; year++) {
      const monthStart = year === fromYear ? fromMonth : 0;
      const monthEnd = year === toYear ? toMonth : 11;
      for (let month = monthStart; month <= monthEnd; month++) {
        const monthKey = `${year}-${month}`;
        if (!monthlyMap.has(monthKey)) {
          const labelDate = new Date(Date.UTC(year, month, 1));
          monthlyMap.set(monthKey, {
            month: formatMonthLabel(labelDate),
            revenue: 0,
            expenses: 0,
            profit: 0,
            doctorEarnings: 0,
          });
        }
      }
    }

    const monthlyData = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => {
        const [aYear, aMonth] = a.split("-").map(Number);
        const [bYear, bMonth] = b.split("-").map(Number);
        return aYear - bYear || aMonth - bMonth;
      })
      .map(([, item]) => {
        const profit = item.revenue - item.expenses;
        return {
          ...item,
          profit,
        };
      });

    const revenueSources = Array.from(revenueSourcesMap.values());
    const netProfit = totalRevenue;

    const recentTransactions = transactions
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .slice(0, 10);

    return {
      message: "Reporte financiero del doctor encontrado exitosamente",
      data: {
        meta: { from, to },
        stats: {
          totalRevenue: money(totalRevenue),
          totalExpenses: 0,
          netProfit: money(netProfit),
          doctorEarnings: money(doctorEarnings),
          doctorCommission,
        },
        monthlyData,
        revenueSources,
        recentTransactions,
        exchangeRate,
      },
    };
  }
}
