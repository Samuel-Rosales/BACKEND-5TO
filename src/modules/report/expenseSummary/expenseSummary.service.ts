import fs from 'fs';
import path from 'path';
import { prisma } from '@/configs';
import React from 'react';
import {
  ExpenseSummaryAlert,
  ExpenseSummaryCategoryItem,
  ExpenseSummaryInfo,
  ExpenseSummaryPeriod,
  ExpenseSummaryPeriodBucket,
  ExpenseSummaryPayrollBySpecialtyItem,
  ExpenseSummaryQueryRange,
  ExpenseSummaryResponse,
  ExpenseSummarySalaryByRoleItem,
  ExpenseSummarySupplierItem,
} from './expenseSummary.interface';

type PdfRenderer = {
  StyleSheet: any;
  Text: any;
  View: any;
  Document: any;
  Page: any;
  Image: any;
  renderToBuffer: (doc: React.ReactElement<any>) => Promise<Buffer>;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const resolveLogoBase64 = () => {
    const candidates = [
        path.resolve(process.cwd(), '..', 'FRONTEND-5TO', 'src', 'assets', 'clinicasintext.png'),
        path.resolve(process.cwd(), '..', '..', 'FRONTEND-5TO', 'src', 'assets', 'clinicasintext.png'),
    ];
    const foundPath = candidates.find((candidate) => fs.existsSync(candidate));
    if (foundPath) {
        const bitmap = fs.readFileSync(foundPath);
        return `data:image/png;base64,${bitmap.toString('base64')}`;
    }
    return null;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const formatMonthLabel = (date: Date): string => new Intl.DateTimeFormat('es-VE', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);

const formatDayLabel = (date: Date): string => new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date);

const formatWeekLabel = (date: Date): string => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return `${formatDayLabel(start)} - ${formatDayLabel(end)}`;
};

const getStartOfWeek = (date: Date): Date => {
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const diff = (current.getUTCDay() + 6) % 7;
  current.setUTCDate(current.getUTCDate() - diff);
  return current;
};

const getBucketKey = (date: Date, period: ExpenseSummaryPeriod): string => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  if (period === 'day') return formatDateOnly(utcDate);
  if (period === 'week') {
    const startOfWeek = getStartOfWeek(utcDate);
    return formatDateOnly(startOfWeek);
  }
  if (period === 'month') return `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}`;
  return String(utcDate.getUTCFullYear());
};

const getBucketLabel = (key: string, period: ExpenseSummaryPeriod): string => {
  if (period === 'day') return formatDayLabel(new Date(`${key}T00:00:00.000Z`));
  if (period === 'week') return formatWeekLabel(new Date(`${key}T00:00:00.000Z`));
  if (period === 'month') return formatMonthLabel(new Date(`${key}-01T00:00:00.000Z`));
  return key;
};

const buildPeriodBuckets = (from: Date, to: Date, period: ExpenseSummaryPeriod): ExpenseSummaryPeriodBucket[] => {
  const buckets = new Map<string, ExpenseSummaryPeriodBucket>();
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));

  while (cursor <= to) {
    const key = getBucketKey(cursor, period);
    if (!buckets.has(key)) {
      buckets.set(key, { label: getBucketLabel(key, period), amountUsd: 0 });
    }

    if (period === 'day') {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    } else if (period === 'week') {
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    } else if (period === 'month') {
      cursor.setUTCMonth(cursor.getUTCMonth() + 1, 1);
    } else {
      cursor.setUTCFullYear(cursor.getUTCFullYear() + 1, 0, 1);
    }
  }

  return [...buckets.values()];
};

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

const moneyText = (value: number) => `$${roundMoney(value).toFixed(2)}`;

const createStyles = (StyleSheet: PdfRenderer['StyleSheet']) => StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', fontSize: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottom: '1 solid #cbd5e1', paddingBottom: 10 },
  headerTextContainer: { flex: 1, marginLeft: 15 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#475569' },
  meta: { fontSize: 9, color: '#64748b', marginTop: 4 },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0f172a', backgroundColor: '#f1f5f9', padding: 6, marginBottom: 8 },
  table: { borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', paddingVertical: 5, paddingHorizontal: 6 },
  tableRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 6, borderTop: '0.5 solid #e2e8f0' },
  tableCell: { flex: 1, color: '#334155' },
  tableCellRight: { width: 90, textAlign: 'right', color: '#334155' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 6, borderBottom: '0.5 solid #e2e8f0' },
  rowLabel: { color: '#334155', flex: 1 },
  rowValue: { color: '#334155', textAlign: 'right', width: 120 },
  footer: { position: 'absolute', bottom: 28, left: 36, right: 36, textAlign: 'center', color: '#64748b', fontSize: 8 },
});

const t = (Text: PdfRenderer['Text'], content: React.ReactNode, style?: unknown) => React.createElement(Text as any, { style }, content);
const v = (View: PdfRenderer['View'], children: React.ReactNode[], style?: unknown) => React.createElement(View as any, { style }, ...children);

const createExpenseSummaryDocument = (pdf: PdfRenderer, styles: ReturnType<typeof createStyles>) => ({ data, logoDataUri }: { data: ExpenseSummaryResponse['data'], logoDataUri: string | null }) => React.createElement(
  pdf.Document as any,
  null,
  React.createElement(
    pdf.Page as any,
    { size: 'A4', style: styles.page },
    v(pdf.View, [
      logoDataUri ? React.createElement(pdf.Image as any, { src: logoDataUri, style: { width: 56, height: 56 } }) : null,
      v(pdf.View, [
        t(pdf.Text, 'Reporte de Gastos', styles.title),
        t(pdf.Text, 'Resumen ejecutivo de egresos', styles.subtitle),
        t(pdf.Text, `Periodo: ${data.meta.from} - ${data.meta.to} | Generado: ${new Date().toLocaleString('es-VE')}`, styles.meta),
      ], styles.headerTextContainer)
    ], styles.header),
    v(pdf.View, [
      t(pdf.Text, 'RESUMEN', styles.sectionTitle),
      v(pdf.View, [t(pdf.Text, 'Gasto total', styles.rowLabel), t(pdf.Text, moneyText(data.summary.totalExpenseUsd), styles.rowValue)], styles.row),
      v(pdf.View, [t(pdf.Text, 'OPEX', styles.rowLabel), t(pdf.Text, moneyText(data.summary.opexUsd), styles.rowValue)], styles.row),
      v(pdf.View, [t(pdf.Text, 'Compras', styles.rowLabel), t(pdf.Text, moneyText(data.summary.purchasesUsd), styles.rowValue)], styles.row),
      v(pdf.View, [t(pdf.Text, 'Nómina', styles.rowLabel), t(pdf.Text, moneyText(data.summary.payrollUsd + data.summary.salaryAdminUsd), styles.rowValue)], styles.row),
    ], styles.section),
    v(pdf.View, [
      t(pdf.Text, 'DESGLOSE POR CATEGORÍA', styles.sectionTitle),
      ...data.breakdownByCategory.map((item) => v(pdf.View, [t(pdf.Text, item.category, styles.rowLabel), t(pdf.Text, moneyText(item.amountUsd), styles.rowValue)], styles.row)),
    ], styles.section),
      v(pdf.View, [
        t(pdf.Text, 'PROVEEDORES DE SERVICIOS', styles.sectionTitle),
        v(pdf.View, [
          t(pdf.Text, 'Proveedor', styles.tableCell),
          t(pdf.Text, 'Total', styles.tableCellRight),
          t(pdf.Text, 'Pagado', styles.tableCellRight),
          t(pdf.Text, 'Pendiente', styles.tableCellRight),
          t(pdf.Text, 'Facturas', styles.tableCellRight),
        ], styles.tableHeader),
        ...data.servicesBySupplier.slice(0, 8).map((item) => v(pdf.View, [
          t(pdf.Text, item.supplier, styles.tableCell),
          t(pdf.Text, moneyText(item.totalUsd), styles.tableCellRight),
          t(pdf.Text, moneyText(item.paidUsd), styles.tableCellRight),
          t(pdf.Text, moneyText(item.pendingUsd), styles.tableCellRight),
          t(pdf.Text, String(item.invoices), styles.tableCellRight),
        ], styles.tableRow)),
      ], styles.section),
      v(pdf.View, [
        t(pdf.Text, 'COMPRAS POR CATEGORÍA', styles.sectionTitle),
        v(pdf.View, [
          t(pdf.Text, 'Categoría', styles.tableCell),
          t(pdf.Text, 'Monto', styles.tableCellRight),
          t(pdf.Text, '%', styles.tableCellRight),
        ], styles.tableHeader),
        ...data.purchasesByCategory.slice(0, 8).map((item) => v(pdf.View, [
          t(pdf.Text, item.category, styles.tableCell),
          t(pdf.Text, moneyText(item.amountUsd), styles.tableCellRight),
          t(pdf.Text, `${item.percentage.toFixed(1)}%`, styles.tableCellRight),
        ], styles.tableRow)),
      ], styles.section),
      v(pdf.View, [
        t(pdf.Text, 'NÓMINA POR ESPECIALIDAD', styles.sectionTitle),
        v(pdf.View, [
          t(pdf.Text, 'Especialidad', styles.tableCell),
          t(pdf.Text, 'Empleados', styles.tableCellRight),
          t(pdf.Text, 'Monto', styles.tableCellRight),
        ], styles.tableHeader),
        ...data.payrollBySpecialty.slice(0, 8).map((item) => v(pdf.View, [
          t(pdf.Text, item.specialty, styles.tableCell),
          t(pdf.Text, String(item.employees), styles.tableCellRight),
          t(pdf.Text, moneyText(item.amountUsd), styles.tableCellRight),
        ], styles.tableRow)),
      ], styles.section),
      v(pdf.View, [
        t(pdf.Text, 'SALARIOS ADMINISTRATIVOS', styles.sectionTitle),
        v(pdf.View, [
          t(pdf.Text, 'Rol', styles.tableCell),
          t(pdf.Text, 'Empleados', styles.tableCellRight),
          t(pdf.Text, 'Monto', styles.tableCellRight),
        ], styles.tableHeader),
        ...data.salaryByRole.slice(0, 8).map((item) => v(pdf.View, [
          t(pdf.Text, item.role, styles.tableCell),
          t(pdf.Text, String(item.employees), styles.tableCellRight),
          t(pdf.Text, moneyText(item.amountUsd), styles.tableCellRight),
        ], styles.tableRow)),
      ], styles.section),
      v(pdf.View, [
        t(pdf.Text, 'ALERTAS', styles.sectionTitle),
        ...data.alerts.map((item) => t(pdf.Text, `• ${item.message}`, styles.rowLabel)),
      ], styles.section),
      t(pdf.Text, `Generado por VitalFe & Alegria`, styles.footer),
    )
);

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

const getRangeData = async (from: Date, to: Date, period: ExpenseSummaryPeriod) => {
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
      breakdown: [],
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

  const purchaseItems = purchases.flatMap((purchase) =>
    purchase.items.map((item) => ({
      ...item,
      purchaseDate: purchase.date,
    })),
  );

  const purchasesGrouped = groupBy(purchaseItems, (item) => `${item.supply.categoryId}-${item.supply.category.name}`);
  const purchasesByCategory = [...purchasesGrouped.entries()].map(([, items]) => {
    const first = items[0];
    const amountUsd = roundMoney(items.reduce((acc, item) => acc + toNumber(item.unit_cost) * toNumber(item.quantity), 0));
    const breakdownMap = new Map<string, ExpenseSummaryPeriodBucket>();
    const buckets = buildPeriodBuckets(from, to, period);

    for (const bucket of buckets) {
      breakdownMap.set(bucket.label, { ...bucket });
    }

    for (const item of items) {
      const purchaseDate = item.purchaseDate ?? null;
      if (!purchaseDate) continue;
      const bucketKey = getBucketKey(new Date(purchaseDate), period);
      const bucketLabel = getBucketLabel(bucketKey, period);
      const current = breakdownMap.get(bucketLabel) ?? { label: bucketLabel, amountUsd: 0 };
      current.amountUsd = roundMoney(current.amountUsd + toNumber(item.unit_cost) * toNumber(item.quantity));
      breakdownMap.set(bucketLabel, current);
    }

    return {
      categoryId: first.supply.categoryId,
      category: first.supply.category.name,
      amountUsd,
      percentage: roundMoney(purchasesUsd > 0 ? (amountUsd / purchasesUsd) * 100 : 0),
      breakdown: [...breakdownMap.values()],
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
      period: params.period || 'week',
    };

    const fromDate = parseDateOnly(resolvedRange.from);
    const toDate = parseDateOnly(resolvedRange.to, true);
    const previousRange = getPreviousRange(fromDate, toDate);

    const current = await getRangeData(fromDate, toDate, resolvedRange.period);
    const previous = await getRangeData(parseDateOnly(previousRange.from), parseDateOnly(previousRange.to, true), resolvedRange.period);

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
          period: resolvedRange.period,
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

  public static async generatePdf(params: Partial<ExpenseSummaryQueryRange>): Promise<Buffer> {
    const report = await this.getSummary(params);
    const logoDataUri = resolveLogoBase64();
    const pdf = await import('@react-pdf/renderer');
    const styles = createStyles(pdf.StyleSheet);
    const doc = React.createElement(createExpenseSummaryDocument(pdf, styles), { data: report.data, logoDataUri });
    return await pdf.renderToBuffer(doc as React.ReactElement<any>);
  }
}