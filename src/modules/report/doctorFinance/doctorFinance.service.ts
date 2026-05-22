import { prisma } from "@/configs";
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
  date.toLocaleDateString("es-VE", { month: "short" });

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
      select: { id: true },
    });

    if (!doctor) {
      return {
        message: "Doctor no encontrado",
        data: {
          meta: { from, to },
          stats: {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0,
            doctorEarnings: 0,
          },
          monthlyData: [],
          revenueSources: [],
          recentTransactions: [],
        },
      };
    }

    const [consultations, invoiceExpenses, payrollLines] = await Promise.all([
      prisma.consultation.findMany({
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
      }),
      prisma.invoiceExpense.findMany({
        where: {
          date_at: { gte: fromDate, lte: toDate },
        },
        include: {
          category: { select: { name: true } },
          supplier: { select: { name: true } },
        },
        orderBy: { date_at: "desc" },
      }),
      prisma.payrollLine.findMany({
        where: {
          consultation: {
            doctorId: doctor.id,
            finished_at: { gte: fromDate, lte: toDate },
          },
        },
        select: {
          base_amount: true,
          commission_percentage: true,
          consultation: {
            select: {
              finished_at: true,
            },
          },
        },
      }),
    ]);

    const monthlyMap = new Map<string, DoctorFinanceMonthlyData>();
    const revenueSourcesMap = new Map<string, DoctorFinanceRevenueSource>();
    const transactions: DoctorFinanceTransaction[] = [];

    let totalRevenue = 0;
    let totalExpenses = 0;
    let doctorEarnings = 0;

    for (const consultation of consultations) {
      if (!consultation.invoice?.date_at) continue;
      const date = consultation.invoice.date_at;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = formatMonthLabel(date);
      const revenue = Number(consultation.invoice.total_usd ?? 0);
      totalRevenue += revenue;

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
        amount: revenue,
        date: formatDateOnly(date),
      });
    }

    for (const expense of invoiceExpenses) {
      const amount = Number(expense.total_amount ?? 0);
      if (!expense.date_at) continue;
      totalExpenses += amount;
      const date = expense.date_at;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = formatMonthLabel(date);
      const monthly =
        monthlyMap.get(monthKey) ??
        ({
          month: monthLabel,
          revenue: 0,
          expenses: 0,
          profit: 0,
          doctorEarnings: 0,
        } satisfies DoctorFinanceMonthlyData);
      monthly.expenses += amount;
      monthlyMap.set(monthKey, monthly);

      const category = expense.category?.name ?? "Gastos";
      const supplierName = expense.supplier?.name ?? "";
      transactions.push({
        id: expense.id,
        description: supplierName ? `Gasto - ${supplierName}` : "Gasto",
        category,
        type: "expense",
        amount,
        date: formatDateOnly(date),
      });
    }

    for (const line of payrollLines) {
      if (!line.consultation.finished_at) continue;
      const date = line.consultation.finished_at;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = formatMonthLabel(date);
      const amount = computeDoctorLineAmount(
        Number(line.base_amount ?? 0),
        Number(line.commission_percentage ?? 0),
      );
      doctorEarnings += amount;
      const monthly =
        monthlyMap.get(monthKey) ??
        ({
          month: monthLabel,
          revenue: 0,
          expenses: 0,
          profit: 0,
          doctorEarnings: 0,
        } satisfies DoctorFinanceMonthlyData);
      monthly.doctorEarnings += amount;
      monthlyMap.set(monthKey, monthly);
    }

    const monthlyData = Array.from(monthlyMap.values()).map((item) => {
      const profit = item.revenue - item.expenses;
      return {
        ...item,
        profit,
      };
    });

    const revenueSources = Array.from(revenueSourcesMap.values());
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue
      ? Math.round((netProfit / totalRevenue) * 100)
      : 0;

    const recentTransactions = transactions
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .slice(0, 10);

    return {
      message: "Reporte financiero del doctor encontrado exitosamente",
      data: {
        meta: { from, to },
        stats: {
          totalRevenue: money(totalRevenue),
          totalExpenses: money(totalExpenses),
          netProfit: money(netProfit),
          profitMargin,
          doctorEarnings: money(doctorEarnings),
        },
        monthlyData,
        revenueSources,
        recentTransactions,
      },
    };
  }
}
