import { prisma } from '@/configs';
import {
  ExpenseSummaryAlert,
  ExpenseSummaryCategoryItem,
  ExpenseSummaryInfo,
  ExpenseSummaryPayrollBySpecialtyItem,
  ExpenseSummaryQueryRange,
  ExpenseSummaryResponse,
  ExpenseSummarySalaryByRoleItem,
  ExpenseSummarySupplierItem,
} from './expenseSummary.interface';

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

const getDefaultRange = (): ExpenseSummaryQueryRange => {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { from: formatDateOnly(from), to: formatDateOnly(now) };
};

const getPreviousRange = (from: Date, to: Date): ExpenseSummaryQueryRange => {
  const periodDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1);
  const previousTo = new Date(from.getTime() - DAY_MS);
  const previousFrom = new Date(previousTo.getTime() - (periodDays - 1) * DAY_MS);
  return { from: formatDateOnly(previousFrom), to: formatDateOnly(previousTo) };
};

const pctChange = (current: number, previous: number): number => {
  if (!previous) return current > 0 ? 100 : 0;
  return roundMoney(((current - previous) / previous) * 100);
};

const groupBy = <T>(items: T[], keyFn: (item: T) => string) => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
};

const getRangeData = async (from: Date, to: Date) => {
  const [invoiceExpenses, purchases, payrollLines, salaryPayments, latestRate] = await Promise.all([
    prisma.invoiceExpense.findMany({
      where: { date_at: { gte: from, lte: to } },
      include: {
        category: true,
        supplier: true,
        payments: {
          include: {
            paymentMethod: true,
            exchangeRate: true,
          },
        },
      },
    }),
    prisma.purchase.findMany({
      where: { date: { gte: from, lte: to } },
      include: {
        supplier: true,
        exchangeRate: true,
        items: {
          include: {
            supply: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    }),
    prisma.payrollLine.findMany({
      where: {
        payroll: {
          period_start: { gte: from },
          period_end: { lte: to },
        },
      },
      include: {
        consultation: {
          include: {
            doctor: {
              include: {
                user: true,
                specialty: true,
              },
            },
          },
        },
      },
    }),
    prisma.salaryPayment.findMany({
      where: { date_at: { gte: from, lte: to } },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    }),
    prisma.exchangeRate.findFirst({
      where: { is_active: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const rate = latestRate ? toNumber(latestRate.rate) : 1;

  const opexUsd = invoiceExpenses.reduce((acc, expense) => acc + toNumber(expense.total_amount), 0);

  const purchasesUsd = purchases.reduce((acc, purchase) => {
    const purchaseTotal = purchase.items.reduce((sum, item) => sum + toNumber(item.unit_cost) * toNumber(item.quantity), 0);
    return acc + purchaseTotal;
  }, 0);

  const payrollUsd = payrollLines.reduce((acc, line) => acc + toNumber(line.base_amount), 0);
  const salaryAdminUsd = salaryPayments.reduce((acc, payment) => acc + toNumber(payment.amount), 0);

  const totalExpenseUsd = roundMoney(opexUsd + purchasesUsd + payrollUsd + salaryAdminUsd);

  const categoryMap = new Map<string, ExpenseSummaryCategoryItem>();
  for (const expense of invoiceExpenses) {
    const key = `${expense.categoryId}-${expense.category.name}`;
    const current = categoryMap.get(key) ?? {
      categoryId: expense.categoryId,
      category: expense.category.name,
      amountUsd: 0,
      percentage: 0,
    };
    current.amountUsd = roundMoney(current.amountUsd + toNumber(expense.total_amount));
    categoryMap.set(key, current);
  }

  const breakdownByCategory = [...categoryMap.values()]
    .map((item) => ({
      ...item,
      percentage: roundMoney(opexUsd > 0 ? (item.amountUsd / opexUsd) * 100 : 0),
    }))
    .sort((a, b) => b.amountUsd - a.amountUsd);

  const supplierMap = new Map<string, ExpenseSummarySupplierItem>();
  for (const expense of invoiceExpenses) {
    const paidUsd = roundMoney(expense.payments.reduce((sum, payment) => {
      const paymentRate = toNumber(payment.exchangeRate?.rate) || rate;
      const amount = toNumber(payment.amount);
      const currency = String(payment.paymentMethod?.currency ?? 'USD').toUpperCase();
      return sum + (currency === 'VES' ? (paymentRate > 0 ? amount / paymentRate : 0) : amount);
    }, 0));
    const pendingUsd = roundMoney(Math.max(toNumber(expense.total_amount) - paidUsd, 0));
    const key = `${expense.supplierId}-${expense.supplier.name}`;
    const current = supplierMap.get(key) ?? {
      supplierId: expense.supplierId,
      supplier: expense.supplier.name,
      totalUsd: 0,
      paidUsd: 0,
      pendingUsd: 0,
      invoices: 0,
    };
    current.totalUsd = roundMoney(current.totalUsd + toNumber(expense.total_amount));
    current.paidUsd = roundMoney(current.paidUsd + paidUsd);
    current.pendingUsd = roundMoney(current.pendingUsd + pendingUsd);
    current.invoices += 1;
    supplierMap.set(key, current);
  }

  const servicesBySupplier = [...supplierMap.values()].sort((a, b) => b.pendingUsd - a.pendingUsd);

  const purchasesGrouped = groupBy(purchases.flatMap((purchase) => purchase.items), (item) => `${item.supply.categoryId}-${item.supply.category.name}`);
  const purchasesByCategory = [...purchasesGrouped.entries()].map(([key, items]) => {
    const first = items[0];
    const amountUsd = roundMoney(items.reduce((acc, item) => acc + toNumber(item.unit_cost) * toNumber(item.quantity), 0));
    return {
      categoryId: first.supply.categoryId,
      category: first.supply.category.name,
      amountUsd,
      percentage: roundMoney(purchasesUsd > 0 ? (amountUsd / purchasesUsd) * 100 : 0),
    };
  }).sort((a, b) => b.amountUsd - a.amountUsd);

  const payrollMap = new Map<string, ExpenseSummaryPayrollBySpecialtyItem>();
  for (const line of payrollLines) {
    const specialtyId = line.consultation?.doctor?.specialty?.id ?? null;
    const specialty = line.consultation?.doctor?.specialty?.name ?? 'Sin especialidad';
    const key = `${specialtyId ?? 'null'}-${specialty}`;
    const current = payrollMap.get(key) ?? { specialtyId, specialty, employees: 0, amountUsd: 0 };
    current.amountUsd = roundMoney(current.amountUsd + toNumber(line.base_amount));
    current.employees += 1;
    payrollMap.set(key, current);
  }

  const payrollBySpecialty = [...payrollMap.values()].sort((a, b) => b.amountUsd - a.amountUsd);

  const roleMap = new Map<string, ExpenseSummarySalaryByRoleItem>();
  for (const payment of salaryPayments) {
    const roleId = payment.user.role?.id ?? null;
    const role = payment.user.role?.name ?? 'Sin rol';
    const key = `${roleId ?? 'null'}-${role}`;
    const current = roleMap.get(key) ?? { roleId, role, employees: 0, amountUsd: 0 };
    current.amountUsd = roundMoney(current.amountUsd + toNumber(payment.amount));
    current.employees += 1;
    roleMap.set(key, current);
  }

  const salaryByRole = [...roleMap.values()].sort((a, b) => b.amountUsd - a.amountUsd);

  const summary: ExpenseSummaryInfo = {
    totalExpenseUsd,
    opexUsd: roundMoney(opexUsd),
    purchasesUsd: roundMoney(purchasesUsd),
    payrollUsd: roundMoney(payrollUsd),
    salaryAdminUsd: roundMoney(salaryAdminUsd),
    invoiceExpenseCount: invoiceExpenses.length,
    purchaseCount: purchases.length,
    payrollDoctorCount: payrollLines.length,
    payrollSalaryCount: salaryPayments.length,
    expenseTrendPct: 0,
  };

  return {
    summary,
    breakdownByCategory,
    servicesBySupplier,
    purchasesByCategory,
    payrollBySpecialty,
    salaryByRole,
  };
};

export class ExpenseSummaryService {
  public static async getSummary(params: Partial<ExpenseSummaryQueryRange>): Promise<ExpenseSummaryResponse> {
    const resolvedRange = {
      from: params.from || getDefaultRange().from,
      to: params.to || getDefaultRange().to,
    };

    const fromDate = parseDateOnly(resolvedRange.from);
    const toDate = parseDateOnly(resolvedRange.to, true);
    const previousRange = getPreviousRange(fromDate, toDate);

    const current = await getRangeData(fromDate, toDate);
    const previous = await getRangeData(parseDateOnly(previousRange.from), parseDateOnly(previousRange.to, true));

    const alerts: ExpenseSummaryAlert[] = [];

    if (current.summary.opexUsd > previous.summary.opexUsd) {
      alerts.push({
        severity: 'warning',
        message: 'Los gastos operativos crecieron respecto al periodo anterior.',
      });
    } else {
      alerts.push({
        severity: 'success',
        message: 'Los gastos operativos están bajo control en el rango consultado.',
      });
    }

    if (current.summary.salaryAdminUsd > 0) {
      alerts.push({
        severity: 'info',
        message: `La nómina administrativa suma ${current.summary.salaryAdminUsd.toFixed(2)} USD en el periodo.`,
        amountUsd: current.summary.salaryAdminUsd,
      });
    }

    const summary: ExpenseSummaryInfo = {
      ...current.summary,
      expenseTrendPct: pctChange(current.summary.totalExpenseUsd, previous.summary.totalExpenseUsd),
    };

    return {
      message: 'Reporte de egresos encontrado exitosamente',
      data: {
        meta: {
          from: resolvedRange.from,
          to: resolvedRange.to,
          previousFrom: previousRange.from,
          previousTo: previousRange.to,
          periodDays: Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / DAY_MS) + 1),
        },
        summary,
        breakdownByCategory: current.breakdownByCategory,
        servicesBySupplier: current.servicesBySupplier,
        purchasesByCategory: current.purchasesByCategory,
        payrollBySpecialty: current.payrollBySpecialty,
        salaryByRole: current.salaryByRole,
        alerts,
      },
    };
  }
}
