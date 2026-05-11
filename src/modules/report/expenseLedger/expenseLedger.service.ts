import { prisma } from '@/configs';
import {
  ExpenseLedgerQueryParams,
  ExpenseLedgerResponse,
  ExpenseSource,
  ExpenseLedgerItem,
  PayrollMode,
} from './expenseLedger.interface';

export class ExpenseLedgerService {
  public static async getLedger(params: ExpenseLedgerQueryParams): Promise<ExpenseLedgerResponse> {
    const { from, to, source = ExpenseSource.ALL, status, page = 1, pageSize = 20, payrollMode = PayrollMode.ACCRUED, currencyView } = params;

    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const promises: Promise<ExpenseLedgerItem[]>[] = [];

    // 1. OPEX
    if (source === ExpenseSource.ALL || source === ExpenseSource.OPEX) {
      promises.push(this.getOpex(fromDate, toDate));
    }

    // 2. PURCHASE
    if (source === ExpenseSource.ALL || source === ExpenseSource.PURCHASE) {
      promises.push(this.getPurchases(fromDate, toDate));
    }

    // 3. PAYROLL
    if (source === ExpenseSource.ALL || source === ExpenseSource.PAYROLL) {
      promises.push(this.getPayroll(fromDate, toDate, payrollMode, status));
    }

    const results = await Promise.all(promises);
    let allItems = results.flat();

    // Ordenar por occurredAt desc
    allItems.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    // Paginación
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedItems = allItems.slice((page - 1) * pageSize, page * pageSize);

    // Calcular totales
    const totals = {
      totalUsd: 0,
      totalVes: 0,
      bySource: {
        PURCHASE: { totalUsd: 0, totalVes: 0 },
        OPEX: { totalUsd: 0, totalVes: 0 },
        PAYROLL: { totalUsd: 0, totalVes: 0 },
      },
    };

    allItems.forEach(item => {
      totals.totalUsd += item.amountUsd;
      totals.totalVes += item.amountVes;
      if (item.source === 'PURCHASE') {
        totals.bySource.PURCHASE.totalUsd += item.amountUsd;
        totals.bySource.PURCHASE.totalVes += item.amountVes;
      } else if (item.source === 'OPEX') {
        totals.bySource.OPEX.totalUsd += item.amountUsd;
        totals.bySource.OPEX.totalVes += item.amountVes;
      } else if (item.source === 'PAYROLL') {
        totals.bySource.PAYROLL.totalUsd += item.amountUsd;
        totals.bySource.PAYROLL.totalVes += item.amountVes;
      }
    });

    const warnings: string[] = [];
    if ((source === ExpenseSource.ALL || source === ExpenseSource.PAYROLL) && payrollMode === PayrollMode.PAID) {
      warnings.push("Modo PAID en nómina no está soportado completamente por falta de tabla PayrollPayment. Devolviendo resultados vacíos o limitados para nómina.");
    }

    return {
      message: 'Egresos consolidados encontrados exitosamente',
      data: {
        items: paginatedItems,
        totals,
        meta: {
          page,
          pageSize,
          totalItems,
          totalPages,
          warnings: warnings.length > 0 ? warnings : undefined,
          filtersApplied: {
            from,
            to,
            source,
            currencyView: currencyView || 'USD',
            payrollMode,
          },
        },
      },
    };
  }

  private static async getOpex(from: Date, to: Date): Promise<ExpenseLedgerItem[]> {
    const expenses = await prisma.expensePayment.findMany({
      where: {
        date_at: {
          gte: from,
          lte: to,
        },
      },
      include: {
        paymentMethod: true,
        exchangeRate: true,
        invoiceExpense: {
          include: {
            category: true,
            supplier: true,
          },
        },
      },
    });

    return expenses.map((exp) => {
      const isVes = exp.paymentMethod.currency === 'VES';
      const rate = Number(exp.exchangeRate.rate);
      const amount = Number(exp.amount);

      let amountUsd = 0;
      let amountVes = 0;

      if (isVes) {
        amountUsd = rate > 0 ? amount / rate : 0;
        amountVes = amount;
      } else {
        amountUsd = amount;
        amountVes = amount * rate;
      }

      return {
        id: `OPEX-${exp.id}`,
        source: 'OPEX',
        sourceId: exp.id,
        occurredAt: (exp.date_at || new Date()).toISOString(),
        description: `Pago de OPEX a ${exp.invoiceExpense.supplier.name}`,
        counterparty: exp.invoiceExpense.supplier.name,
        category: exp.invoiceExpense.category.name,
        status: 'PAID',
        paymentMethod: exp.paymentMethod.name,
        currencyOriginal: exp.paymentMethod.currency as 'USD' | 'VES',
        amountOriginal: amount,
        exchangeRate: rate,
        amountUsd,
        amountVes,
        notes: null,
      };
    });
  }

  private static async getPurchases(from: Date, to: Date): Promise<ExpenseLedgerItem[]> {
    const purchases = await prisma.purchasePayment.findMany({
      where: {
        payment_date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        paymentMethod: true,
        purchase: {
          include: {
            supplier: true,
            exchangeRate: true,
          },
        },
      },
    });

    return purchases.map((pay) => {
      // paymentMethod puede que no defina la moneda de forma rigurosa en su modelo de datos, pero tiene type y name
      // currencyOriginal puede venir de pay.currency o de pay.paymentMethod.currency
      let curr = pay.currency || pay.paymentMethod.currency;
      if (curr !== 'USD' && curr !== 'VES') {
        curr = 'USD'; // default safe
      }
      const isVes = curr === 'VES';
      const rate = Number(pay.purchase.exchangeRate.rate);
      const amount = Number(pay.amount);

      let amountUsd = 0;
      let amountVes = 0;

      if (isVes) {
        amountUsd = rate > 0 ? amount / rate : 0;
        amountVes = amount;
      } else {
        amountUsd = amount;
        amountVes = amount * rate;
      }

      return {
        id: `PURCHASE-${pay.id}`,
        source: 'PURCHASE',
        sourceId: pay.id,
        occurredAt: (pay.payment_date || new Date()).toISOString(),
        description: `Pago de compra a ${pay.purchase.supplier.name}`,
        counterparty: pay.purchase.supplier.name,
        category: 'Insumos',
        status: 'PAID',
        paymentMethod: pay.paymentMethod.name,
        currencyOriginal: curr as 'USD' | 'VES',
        amountOriginal: amount,
        exchangeRate: rate,
        amountUsd,
        amountVes,
        notes: pay.reference,
      };
    });
  }

  private static async getPayroll(from: Date, to: Date, mode: PayrollMode, status?: string): Promise<ExpenseLedgerItem[]> {
    if (mode === PayrollMode.PAID) {
      // Como indica el requerimiento, hoy no hay tabla de pago de nómina, por lo tanto devuelve vacío o warning
      return [];
    }

    // ACCRUED
    const whereClause: any = {
      payroll: {
        period_start: { gte: from },
        period_end: { lte: to },
      },
    };
    if (status) {
      whereClause.payroll.status = status;
    }

    const [payrollLines, salaryPayments] = await Promise.all([
      prisma.payrollLine.findMany({
      where: whereClause,
      include: {
        payroll: true,
        consultation: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      }),
      prisma.salaryPayment.findMany({
        where: {
          date_at: {
            gte: from,
            lte: to,
          },
        },
        include: {
          payroll: true,
          user: {
            include: {
              role: true,
            },
          },
        },
      }),
    ]);

    // We might need to get the active exchange rate for the day if payroll doesn't have an exchange rate attached
    // Since it's accrued, we can use the latest exchange rate for simplicity or standard calculation
    const latestRate = await prisma.exchangeRate.findFirst({
      where: { is_active: true },
      orderBy: { createdAt: 'desc' },
    });
    const rate = latestRate ? Number(latestRate.rate) : 1;

    const doctorItems: ExpenseLedgerItem[] = payrollLines.map((line) => {
      const baseAmt = Number(line.base_amount);
      const pct = Number(line.commission_percentage) / 100;
      // Depending on the logic: if the user gets the percentage of the base:
      // We will assume amountUsd is base * pct as standard for doctors
      const amountUsd = baseAmt * pct; 
      const amountVes = amountUsd * rate;

      return {
        id: `PAYROLL-${line.id}`,
        source: 'PAYROLL' as const,
        sourceId: line.id,
        occurredAt: line.payroll.period_end.toISOString(),
        description: `Nómina devengada: ${line.consultation.doctor.user.name} (Consulta #${line.consultation.id})`,
        counterparty: line.consultation.doctor.user.name,
        category: 'Servicios Médicos',
        status: line.payroll.status,
        paymentMethod: null,
        currencyOriginal: 'USD',
        amountOriginal: amountUsd,
        exchangeRate: rate,
        amountUsd,
        amountVes,
        notes: `Base: ${baseAmt}, Comisión: ${Number(line.commission_percentage)}%`,
      } satisfies ExpenseLedgerItem;
    });

    const salaryItems: ExpenseLedgerItem[] = salaryPayments.map((payment) => {
      const amountUsd = Number(payment.amount);
      return {
        id: `SALARY-${payment.id}`,
        source: 'PAYROLL' as const,
        sourceId: payment.id,
        occurredAt: (payment.date_at || payment.payroll.period_end || new Date()).toISOString(),
        description: `Pago salarial: ${payment.user.name} (${payment.user.role.name})`,
        counterparty: payment.user.name,
        category: payment.user.role.name,
        status: payment.payroll.status,
        paymentMethod: null,
        currencyOriginal: 'USD' as const,
        amountOriginal: amountUsd,
        exchangeRate: rate,
        amountUsd,
        amountVes: amountUsd * rate,
        notes: payment.concept ?? `Salario base ${payment.user.role.base_salary ?? amountUsd}`,
      } satisfies ExpenseLedgerItem;
    });

    return [...doctorItems, ...salaryItems];
  }
}
