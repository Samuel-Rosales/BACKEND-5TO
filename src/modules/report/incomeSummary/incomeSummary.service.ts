import { prisma } from '@/configs';
import {
  IncomeSummaryAlert,
  IncomeSummaryBreakdownItem,
  IncomeSummaryCollectionItem,
  IncomeSummaryInfo,
  IncomeSummaryQueryRange,
  IncomeSummaryReceivableItem,
  IncomeSummaryReceivables,
  IncomeSummaryResponse,
} from './incomeSummary.interface';

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

const getDefaultRange = (): IncomeSummaryQueryRange => {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return {
    from: formatDateOnly(from),
    to: formatDateOnly(now),
  };
};

const getPreviousRange = (from: Date, to: Date): IncomeSummaryQueryRange => {
  const periodDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1);
  const previousTo = new Date(from.getTime() - DAY_MS);
  const previousFrom = new Date(previousTo.getTime() - (periodDays - 1) * DAY_MS);

  return {
    from: formatDateOnly(previousFrom),
    to: formatDateOnly(previousTo),
  };
};

const pctChange = (current: number, previous: number): number => {
  if (!previous) return current > 0 ? 100 : 0;
  return roundMoney(((current - previous) / previous) * 100);
};

const normalizeCurrency = (value: unknown): 'USD' | 'VES' => {
  const currency = String(value ?? 'USD').toUpperCase();
  return currency === 'VES' ? 'VES' : 'USD';
};

const paymentAmountUsd = (amount: number, currency: unknown, rate: unknown): number => {
  const normalizedCurrency = normalizeCurrency(currency);
  const exchangeRate = toNumber(rate) || 1;

  if (normalizedCurrency === 'VES') {
    return exchangeRate > 0 ? amount / exchangeRate : 0;
  }

  return amount;
};

const isPaidStatus = (statusName?: string | null): boolean => {
  const status = (statusName ?? '').toLowerCase();
  return status.includes('pagad') || status.includes('paid') || status.includes('cobr') || status.includes('completed');
};

type AggregatedInvoice = {
  invoiceId: number;
  dateAt: Date;
  grossUsd: number;
  collectedUsd: number;
  igtfUsd: number;
  pendingUsd: number;
  daysOutstanding: number;
  status: string;
  patientName: string;
  specialtyId: number | null;
  specialty: string;
  payments: Array<{
    paymentMethodId: number | null;
    paymentMethod: string;
    type: string;
    currency: string;
    amountUsd: number;
    igtfUsd: number;
  }>;
};

const aggregateRange = async (from: Date, to: Date) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      date_at: {
        gte: from,
        lte: to,
      },
    },
    include: {
      status: true,
      patient: {
        include: {
          user: true,
        },
      },
      consultation: {
        include: {
          doctor: {
            include: {
              specialty: true,
            },
          },
        },
      },
      payments: {
        include: {
          paymentMethod: true,
          exchangeRate: true,
        },
      },
    },
  });

  const now = new Date();
  const specialties = new Map<string, IncomeSummaryBreakdownItem>();
  const methods = new Map<string, IncomeSummaryCollectionItem>();
  const receivables: AggregatedInvoice[] = [];

  let grossIncomeUsd = 0;
  let collectedUsd = 0;
  let pendingBalanceUsd = 0;
  let igtfCollectedUsd = 0;
  let paidInvoices = 0;
  let pendingInvoices = 0;

  for (const invoice of invoices) {
    const grossUsd = roundMoney(toNumber(invoice.total_usd));
    const specialtyId = invoice.consultation?.doctor?.specialty?.id ?? null;
    const specialty = invoice.consultation?.doctor?.specialty?.name ?? 'Sin especialidad';
    const status = invoice.status?.name ?? 'Sin estado';
    const patientName = invoice.patient?.user?.name ?? 'Paciente';
    const dateAt = invoice.date_at ?? new Date();

    let invoiceCollectedUsd = 0;
    let invoiceIgtfUsd = 0;

    const paymentItems = invoice.payments.map((payment) => {
      const amount = toNumber(payment.amount_paid);
      const amountUsd = roundMoney(paymentAmountUsd(amount, payment.paymentMethod?.currency, payment.exchangeRate?.rate));
      const igtfUsd = roundMoney(paymentAmountUsd(toNumber(payment.igtf_amount), payment.paymentMethod?.currency, payment.exchangeRate?.rate));

      invoiceCollectedUsd += amountUsd;
      invoiceIgtfUsd += igtfUsd;

      const methodKey = `${payment.paymentMethod?.id ?? 'null'}-${payment.paymentMethod?.name ?? 'Sin método'}`;
      const methodEntry = methods.get(methodKey) ?? {
        paymentMethodId: payment.paymentMethod?.id ?? null,
        paymentMethod: payment.paymentMethod?.name ?? 'Sin método',
        type: payment.paymentMethod?.type ?? 'N/A',
        currency: normalizeCurrency(payment.paymentMethod?.currency),
        payments: 0,
        amountUsd: 0,
        igtfUsd: 0,
        percentage: 0,
      };

      methodEntry.payments += 1;
      methodEntry.amountUsd = roundMoney(methodEntry.amountUsd + amountUsd);
      methodEntry.igtfUsd = roundMoney(methodEntry.igtfUsd + igtfUsd);
      methods.set(methodKey, methodEntry);

      return {
        paymentMethodId: payment.paymentMethod?.id ?? null,
        paymentMethod: payment.paymentMethod?.name ?? 'Sin método',
        type: payment.paymentMethod?.type ?? 'N/A',
        currency: normalizeCurrency(payment.paymentMethod?.currency),
        amountUsd,
        igtfUsd,
      };
    });

    const pendingUsd = roundMoney(Math.max(grossUsd - invoiceCollectedUsd, 0));
    const daysOutstanding = Math.max(0, Math.floor((now.getTime() - new Date(dateAt).getTime()) / DAY_MS));

    grossIncomeUsd = roundMoney(grossIncomeUsd + grossUsd);
    collectedUsd = roundMoney(collectedUsd + invoiceCollectedUsd);
    pendingBalanceUsd = roundMoney(pendingBalanceUsd + pendingUsd);
    igtfCollectedUsd = roundMoney(igtfCollectedUsd + invoiceIgtfUsd);

    if (isPaidStatus(status) || pendingUsd === 0) {
      paidInvoices += 1;
    } else {
      pendingInvoices += 1;
    }

    const specialtyKey = `${specialtyId ?? 'null'}-${specialty}`;
    const specialtyEntry = specialties.get(specialtyKey) ?? {
      specialtyId,
      specialty,
      consultations: 0,
      incomeUsd: 0,
      percentage: 0,
      averageTicketUsd: 0,
    };

    specialtyEntry.consultations += 1;
    specialtyEntry.incomeUsd = roundMoney(specialtyEntry.incomeUsd + grossUsd);
    specialties.set(specialtyKey, specialtyEntry);

    if (pendingUsd > 0) {
      receivables.push({
        invoiceId: invoice.id,
        dateAt,
        grossUsd,
        collectedUsd: invoiceCollectedUsd,
        igtfUsd: invoiceIgtfUsd,
        pendingUsd,
        daysOutstanding,
        status,
        patientName,
        specialtyId,
        specialty,
        payments: paymentItems,
      });
    }
  }

  const summary: IncomeSummaryInfo = {
    grossIncomeUsd,
    collectedUsd,
    pendingBalanceUsd,
    igtfCollectedUsd,
    collectionRate: roundMoney(grossIncomeUsd > 0 ? (collectedUsd / grossIncomeUsd) * 100 : 0),
    averageTicketUsd: roundMoney(invoices.length > 0 ? grossIncomeUsd / invoices.length : 0),
    totalInvoices: invoices.length,
    paidInvoices,
    pendingInvoices,
    grossIncomeTrendPct: 0,
    collectedTrendPct: 0,
    pendingBalanceTrendPct: 0,
  };

  const breakdownBySpecialty = [...specialties.values()]
    .map((item) => ({
      ...item,
      percentage: roundMoney(grossIncomeUsd > 0 ? (item.incomeUsd / grossIncomeUsd) * 100 : 0),
      averageTicketUsd: roundMoney(item.consultations > 0 ? item.incomeUsd / item.consultations : 0),
    }))
    .sort((a, b) => b.incomeUsd - a.incomeUsd);

  const collectionByPaymentMethod = [...methods.values()]
    .map((item) => ({
      ...item,
      percentage: roundMoney(collectedUsd > 0 ? (item.amountUsd / collectedUsd) * 100 : 0),
    }))
    .sort((a, b) => b.amountUsd - a.amountUsd);

  const agingBuckets = [
    { label: '0-30 días', minDays: 0, maxDays: 30 },
    { label: '31-60 días', minDays: 31, maxDays: 60 },
    { label: '61-90 días', minDays: 61, maxDays: 90 },
    { label: '90+ días', minDays: 91, maxDays: null },
  ].map((bucket) => {
    const items = receivables.filter((item) => item.daysOutstanding >= bucket.minDays && (bucket.maxDays === null || item.daysOutstanding <= bucket.maxDays));
    return {
      ...bucket,
      count: items.length,
      amountUsd: roundMoney(items.reduce((acc, item) => acc + item.pendingUsd, 0)),
    };
  });

  const receivableItems: IncomeSummaryReceivableItem[] = receivables
    .sort((a, b) => b.daysOutstanding - a.daysOutstanding)
    .map((item) => ({
      invoiceId: item.invoiceId,
      patientName: item.patientName,
      specialty: item.specialty,
      invoiceDate: item.dateAt.toISOString(),
      totalUsd: item.grossUsd,
      collectedUsd: item.collectedUsd,
      pendingUsd: item.pendingUsd,
      daysOutstanding: item.daysOutstanding,
      status: item.status,
    }));

  const receivablesSummary: IncomeSummaryReceivables = {
    totalOutstandingUsd: roundMoney(receivables.reduce((acc, item) => acc + item.pendingUsd, 0)),
    overdueCount: receivables.filter((item) => item.daysOutstanding > 60).length,
    averageAgeDays: roundMoney(receivables.length > 0 ? receivables.reduce((acc, item) => acc + item.daysOutstanding, 0) / receivables.length : 0),
    agingBuckets,
    items: receivableItems,
  };

  return {
    summary,
    breakdownBySpecialty,
    collectionByPaymentMethod,
    receivables: receivablesSummary,
  };
};

export class IncomeSummaryService {
  public static async getSummary(params: Partial<IncomeSummaryQueryRange>): Promise<IncomeSummaryResponse> {
    const resolvedRange = {
      from: params.from || getDefaultRange().from,
      to: params.to || getDefaultRange().to,
    };

    const fromDate = parseDateOnly(resolvedRange.from);
    const toDate = parseDateOnly(resolvedRange.to, true);
    const previousRange = getPreviousRange(fromDate, toDate);

    const current = await aggregateRange(fromDate, toDate);
    const previous = await aggregateRange(parseDateOnly(previousRange.from), parseDateOnly(previousRange.to, true));

    const alerts: IncomeSummaryAlert[] = [];

    if (current.receivables.overdueCount > 0) {
      alerts.push({
        severity: 'warning',
        message: `Hay ${current.receivables.overdueCount} facturas con más de 60 días de antigüedad.`,
      });
    } else {
      alerts.push({
        severity: 'success',
        message: 'No se detectaron facturas vencidas en el rango consultado.',
      });
    }

    if (current.summary.pendingBalanceUsd > 0) {
      alerts.push({
        severity: 'info',
        message: `Quedan ${current.summary.pendingInvoices} facturas con saldo pendiente por ${current.summary.pendingBalanceUsd.toFixed(2)} USD.`,
        amountUsd: current.summary.pendingBalanceUsd,
      });
    }

    const summary: IncomeSummaryInfo = {
      ...current.summary,
      grossIncomeTrendPct: pctChange(current.summary.grossIncomeUsd, previous.summary.grossIncomeUsd),
      collectedTrendPct: pctChange(current.summary.collectedUsd, previous.summary.collectedUsd),
      pendingBalanceTrendPct: pctChange(current.summary.pendingBalanceUsd, previous.summary.pendingBalanceUsd),
    };

    return {
      message: 'Reporte de ingresos encontrado exitosamente',
      data: {
        meta: {
          from: resolvedRange.from,
          to: resolvedRange.to,
          previousFrom: previousRange.from,
          previousTo: previousRange.to,
          periodDays: Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / DAY_MS) + 1),
        },
        summary,
        breakdownBySpecialty: current.breakdownBySpecialty,
        collectionByPaymentMethod: current.collectionByPaymentMethod,
        receivables: current.receivables,
        alerts,
      },
    };
  }
}
