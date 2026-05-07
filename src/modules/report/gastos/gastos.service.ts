import { prisma } from '@/configs';
import {
  GastosQueryParams,
  GastosSummaryResponse,
  GastosComprasResponse,
  GastosServiciosResponse,
  GastosNominaResponse,
  StatCard,
  Alert,
} from './gastos.interface';

export class GastosService {
  public static async getSummary(params: GastosQueryParams): Promise<{ message: string; data: GastosSummaryResponse }> {
    const { from, to, currencyView = 'USD' } = params;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const currentRate = await this.getCurrentExchangeRate();
    const previousPeriod = this.getPreviousPeriod(fromDate, toDate);

    const [currentData, previousData, totalIngresos] = await Promise.all([
      this.getCurrentPeriodData(fromDate, toDate),
      this.getCurrentPeriodData(previousPeriod.from, previousPeriod.to),
      this.getTotalIngresos(fromDate, toDate),
    ]);

    const totalGastos = currentData.insumos + currentData.nomina + currentData.servicios + currentData.otro;
    const totalGastosVes = totalGastos * currentRate;

    const trendInsumos = this.calculateTrend(currentData.insumos, previousData.insumos);
    const trendNomina = this.calculateTrend(currentData.nomina, previousData.nomina);
    const trendServicios = this.calculateTrend(currentData.servicios, previousData.servicios);
    const trendCuentasPorPagar = this.calculateTrend(currentData.cuentasPorPagar, previousData.cuentasPorPagar);

    const stats: StatCard[] = [
      {
        title: 'Gastos de Insumo',
        value: currencyView === 'VES' ? this.formatCurrency(currentData.insumos * currentRate) : this.formatCurrency(currentData.insumos),
        trend: trendInsumos.value,
        trendUp: trendInsumos.isUp,
        color: 'warning',
      },
      {
        title: 'Facturación Procesada',
        value: currentData.facturasProcesadas.toString(),
        trend: this.calculateTrend(currentData.facturasProcesadas, previousData.facturasProcesadas).value,
        trendUp: this.calculateTrend(currentData.facturasProcesadas, previousData.facturasProcesadas).isUp,
        color: 'primary',
      },
      {
        title: 'Utilidad Neta',
        value: currencyView === 'VES' ? this.formatCurrency((totalIngresos - totalGastos) * currentRate) : this.formatCurrency(totalIngresos - totalGastos),
        trend: this.calculateTrend(totalIngresos - totalGastos, totalIngresos - previousData.total).value,
        trendUp: this.calculateTrend(totalIngresos - totalGastos, totalIngresos - previousData.total).isUp,
        color: 'success',
      },
      {
        title: 'Cuentas por Pagar',
        value: currencyView === 'VES' ? this.formatCurrency(currentData.cuentasPorPagar * currentRate) : this.formatCurrency(currentData.cuentasPorPagar),
        trend: trendCuentasPorPagar.value,
        trendUp: trendCuentasPorPagar.isUp,
        color: 'danger',
      },
    ];

    const totalBreakdown = totalGastos > 0 ? totalGastos : 1;
    const breakdown = [
      { category: 'Insumos Médicos', amount: currentData.insumos, weight: `${Math.round((currentData.insumos / totalBreakdown) * 100)}%` },
      { category: 'Nómina Operativa', amount: currentData.nomina, weight: `${Math.round((currentData.nomina / totalBreakdown) * 100)}%` },
      { category: 'Servicios Tercerizados', amount: currentData.servicios, weight: `${Math.round((currentData.servicios / totalBreakdown) * 100)}%` },
      { category: 'Mantenimiento y Otros', amount: currentData.otro, weight: `${Math.round((currentData.otro / totalBreakdown) * 100)}%` },
    ];

    const alerts: Alert[] = await this.getGastosAlerts(fromDate, toDate, currentData, previousData);

    return {
      message: 'Resumen de gastos encontrado',
      data: { stats, breakdown, alerts },
    };
  }

  private static getPreviousPeriod(from: Date, to: Date): { from: Date; to: Date } {
    const diffMs = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - diffMs - 1);
    const prevTo = new Date(from.getTime() - 1);
    return { from: prevFrom, to: prevTo };
  }

  private static calculateTrend(current: number, previous: number): { value: string; isUp: boolean } {
    if (previous === 0) {
      return { value: '0', isUp: current > 0 };
    }
    const diff = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(diff).toFixed(1),
      isUp: diff >= 0,
    };
  }

  private static async getCurrentPeriodData(from: Date, to: Date) {
    const [insumos, nomina, servicios, otro, cuentasPorPagar, facturasProcesadas] = await Promise.all([
      this.getTotalPurchases(from, to),
      this.getTotalPayroll(from, to),
      this.getTotalServices(from, to),
      this.getTotalOtherExpenses(from, to),
      this.getCuentasPorPagar(from, to),
      this.getFacturasProcesadas(from, to),
    ]);

    return {
      insumos,
      nomina,
      servicios,
      otro,
      cuentasPorPagar,
      facturasProcesadas,
      total: insumos + nomina + servicios + otro,
    };
  }

  private static async getTotalIngresos(from: Date, to: Date): Promise<number> {
    const invoices = await prisma.invoice.findMany({
      where: {
        date_at: { gte: from, lte: to },
        status: {
          name: { in: ['PAID', 'PENDING'] },
        },
      },
    });
    return invoices.reduce((sum, inv) => sum + Number(inv.total_usd), 0);
  }

  private static async getFacturasProcesadas(from: Date, to: Date): Promise<number> {
    return prisma.invoice.count({
      where: {
        date_at: { gte: from, lte: to },
      },
    });
  }

  private static async getCuentasPorPagar(from: Date, to: Date): Promise<number> {
    const expenses = await prisma.invoiceExpense.findMany({
      where: {
        date_at: { gte: from, lte: to },
      },
      include: {
        payments: true,
      },
    });

    return expenses.reduce((sum, exp) => {
      const paidAmount = exp.payments.reduce((pSum, pay) => pSum + Number(pay.amount), 0);
      const totalAmount = Number(exp.total_amount);
      return sum + Math.max(0, totalAmount - paidAmount);
    }, 0);
  }

  public static async getCompras(params: GastosQueryParams): Promise<{ message: string; data: GastosComprasResponse }> {
    const { from, to, currencyView = 'USD', groupBy = 'week' } = params;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const currentRate = await this.getCurrentExchangeRate();
    const previousPeriod = this.getPreviousPeriod(fromDate, toDate);

    const [currentPurchases, previousPurchases] = await Promise.all([
      prisma.purchase.findMany({
        where: { date: { gte: fromDate, lte: toDate } },
        include: {
          supplier: true,
          items: {
            include: {
              supply: { include: { category: true } },
            },
          },
          exchangeRate: true,
        },
        orderBy: { date: 'asc' },
      }),
      prisma.purchase.findMany({
        where: { date: { gte: previousPeriod.from, lte: previousPeriod.to } },
        include: { items: true, exchangeRate: true },
      }),
    ]);

    const table = this.groupPurchasesByGroupBy(currentPurchases, fromDate, toDate, groupBy);

    const totalCompras = currentPurchases.reduce((sum, p) => {
      const rate = Number(p.exchangeRate?.rate || 1);
      return sum + (p.items.reduce((itemSum, item) => itemSum + Number(item.unit_cost) * item.quantity, 0) / (currencyView === 'VES' ? 1 : rate));
    }, 0);

    const prevTotalCompras = previousPurchases.reduce((sum, p) => {
      const rate = Number(p.exchangeRate?.rate || 1);
      return sum + (p.items.reduce((itemSum, item) => itemSum + Number(item.unit_cost) * item.quantity, 0) / (currencyView === 'VES' ? 1 : rate));
    }, 0);

    const ordersCount = currentPurchases.length;
    const prevOrdersCount = previousPurchases.length;

    const onTimeDeliveries = await this.calculateOnTimeDeliveries(fromDate, toDate);
    const prevOnTimeDeliveries = await this.calculateOnTimeDeliveries(previousPeriod.from, previousPeriod.to);

    const trendTotal = this.calculateTrend(totalCompras, prevTotalCompras);
    const trendOrders = this.calculateTrend(ordersCount, prevOrdersCount);
    const trendOnTime = this.calculateTrend(onTimeDeliveries, prevOnTimeDeliveries);

    const stats: StatCard[] = [
      {
        title: 'Total mensual',
        value: currencyView === 'VES' ? this.formatCurrency(totalCompras * currentRate) : this.formatCurrency(totalCompras),
        trend: trendTotal.value,
        trendUp: trendTotal.isUp,
        color: trendTotal.isUp ? 'danger' : 'success',
      },
      {
        title: 'Ordenes generadas',
        value: ordersCount.toString(),
        trend: trendOrders.value,
        trendUp: trendOrders.isUp,
        color: 'primary',
      },
      {
        title: 'Entregas a tiempo',
        value: `${onTimeDeliveries}%`,
        trend: trendOnTime.value,
        trendUp: trendOnTime.isUp,
        color: trendOnTime.isUp ? 'success' : 'warning',
      },
    ];

    return {
      message: 'Reporte de compras encontrado',
      data: { stats, table },
    };
  }

  private static async calculateOnTimeDeliveries(from: Date, to: Date): Promise<number> {
    const purchases = await prisma.purchase.findMany({
      where: { date: { gte: from, lte: to } },
    });
    
    if (purchases.length === 0) return 0;
    
    const completedCount = purchases.filter(p => p.status === 'COMPLETED').length;
    
    return Math.round((completedCount / purchases.length) * 100);
  }

  private static groupPurchasesByGroupBy(purchases: any[], fromDate: Date, toDate: Date, groupBy: string) {
    const categories = ['Insumos médicos', 'Material descartable', 'Laboratorio'];
    const result: any[] = [];
    
    const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    let periods: string[] = [];
    
    if (groupBy === 'day') {
      const days = Math.min(totalDays, 7);
      for (let i = 0; i < days; i++) {
        const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000);
        periods.push(date.toISOString().split('T')[0]);
      }
    } else if (groupBy === 'week') {
      periods = ['week1', 'week2', 'week3', 'week4'];
    } else {
      periods = ['month1', 'month2'];
    }
    
    for (const category of categories) {
      const row: any = { category };
      
      if (groupBy === 'day') {
        const dayData = this.getDayDataForCategory(purchases, fromDate, category);
        periods.forEach((day, idx) => {
          row[day] = dayData[idx] || 0;
        });
      } else if (groupBy === 'week') {
        const weekData = this.getWeekDataForCategory(purchases, fromDate, toDate, category);
        periods.forEach((week, idx) => {
          row[week] = weekData[idx] || 0;
        });
      } else {
        const monthData = this.getMonthDataForCategory(purchases, fromDate, toDate, category);
        periods.forEach((month, idx) => {
          row[month] = monthData[idx] || 0;
        });
      }
      
      result.push(row);
    }
    
    return result;
  }

  private static getDayDataForCategory(purchases: any[], fromDate: Date, category: string): number[] {
    const days = 7;
    const result = new Array(days).fill(0);
    
    purchases.forEach(p => {
      const purchaseDate = new Date(p.date);
      const dayIndex = Math.floor((purchaseDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < days) {
        p.items.forEach((item: any) => {
          const cat = item.supply?.category?.name?.toLowerCase() || '';
          if (cat.includes(category.split(' ')[0].toLowerCase())) {
            result[dayIndex] += Number(item.unit_cost) * item.quantity;
          }
        });
      }
    });
    
    return result;
  }

  private static getWeekDataForCategory(purchases: any[], fromDate: Date, toDate: Date, category: string): number[] {
    const result = [0, 0, 0, 0];
    const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekLength = totalDays / 4;
    
    purchases.forEach(p => {
      const purchaseDate = new Date(p.date);
      const daysFromStart = Math.floor((purchaseDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.min(Math.floor(daysFromStart / weekLength), 3);
      
      p.items.forEach((item: any) => {
        const cat = item.supply?.category?.name?.toLowerCase() || '';
        if (cat.includes(category.split(' ')[0].toLowerCase())) {
          result[weekIndex] += Number(item.unit_cost) * item.quantity;
        }
      });
    });
    
    return result;
  }

  private static getMonthDataForCategory(purchases: any[], fromDate: Date, toDate: Date, category: string): number[] {
    const result = [0, 0];
    const midDate = new Date(fromDate.getTime() + (toDate.getTime() - fromDate.getTime()) / 2);
    
    purchases.forEach(p => {
      const purchaseDate = new Date(p.date);
      const monthIndex = purchaseDate.getTime() < midDate.getTime() ? 0 : 1;
      
      p.items.forEach((item: any) => {
        const cat = item.supply?.category?.name?.toLowerCase() || '';
        if (cat.includes(category.split(' ')[0].toLowerCase())) {
          result[monthIndex] += Number(item.unit_cost) * item.quantity;
        }
      });
    });
    
    return result;
  }

  public static async getServicios(params: GastosQueryParams): Promise<{ message: string; data: GastosServiciosResponse }> {
    const { from, to, currencyView = 'USD' } = params;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const currentRate = await this.getCurrentExchangeRate();
    const previousPeriod = this.getPreviousPeriod(fromDate, toDate);

    const [currentData, previousData, activoCorriente] = await Promise.all([
      this.getServiciosData(fromDate, toDate),
      this.getServiciosData(previousPeriod.from, previousPeriod.to),
      this.getActivoCorriente(),
    ]);

    const totalPasivo = currentData.totalPending;
    const pendingInvoices = currentData.suppliers.filter(s => s.balance > 0).length;
    const ratioSolvencia = activoCorriente > 0 ? (activoCorriente / totalPasivo).toFixed(1) : '0';
    const prevRatioSolvencia = previousData.totalPending > 0 ? (activoCorriente / previousData.totalPending) : 0;
    const trendRatio = this.calculateTrend(parseFloat(ratioSolvencia), prevRatioSolvencia);

    const trendTotal = this.calculateTrend(totalPasivo, previousData.totalPending);

    const stats: StatCard[] = [
      {
        title: 'Total Pasivo (Servicios)',
        value: currencyView === 'VES' ? this.formatCurrency(totalPasivo * currentRate) : this.formatCurrency(totalPasivo),
        trend: trendTotal.value,
        trendUp: trendTotal.isUp,
        color: 'primary',
      },
      {
        title: 'Facturas por Liquidar',
        value: pendingInvoices.toString(),
        trend: this.calculateTrend(pendingInvoices, previousData.suppliers.filter(s => s.balance > 0).length).value,
        trendUp: pendingInvoices <= previousData.suppliers.filter(s => s.balance > 0).length,
        color: 'warning',
      },
      {
        title: 'Ratio de Solvencia',
        value: ratioSolvencia,
        subText: 'Corto plazo',
        color: parseFloat(ratioSolvencia) >= 1 ? 'success' : 'danger',
      },
    ];

    const table = currentData.suppliers.map(s => ({
      name: s.name,
      balance: currencyView === 'VES' ? s.balance * currentRate : s.balance,
      status: s.status,
      term: s.term,
    }));

    return {
      message: 'Cuentas por pagar encontrado',
      data: { stats, table },
    };
  }

  private static async getServiciosData(from: Date, to: Date) {
    const suppliers = await prisma.supplier.findMany({
      include: {
        expenses: {
          where: {
            date_at: { gte: from, lte: to },
          },
          include: {
            payments: true,
            category: true,
          },
        },
      },
    });

    const suppliersWithBalance = suppliers.map(supplier => {
      const totalPending = supplier.expenses.reduce((sum, expense) => {
        const paidAmount = expense.payments.reduce((pSum, pay) => pSum + Number(pay.amount), 0);
        const totalAmount = Number(expense.total_amount);
        return sum + (totalAmount - paidAmount);
      }, 0);

      return {
        name: supplier.name,
        balance: totalPending,
        status: totalPending > 0 ? 'Pendiente' : 'Pagado',
        term: '30 días',
      };
    });

    return {
      suppliers: suppliersWithBalance,
      totalPending: suppliersWithBalance.reduce((sum, s) => sum + s.balance, 0),
    };
  }

  private static async getActivoCorriente(): Promise<number> {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          name: { in: ['PAID', 'PENDING'] },
        },
      },
    });
    return invoices.reduce((sum, inv) => sum + Number(inv.total_usd), 0);
  }

  public static async getNomina(params: GastosQueryParams): Promise<{ message: string; data: GastosNominaResponse }> {
    const { from, to, currencyView = 'USD' } = params;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const currentRate = await this.getCurrentExchangeRate();
    const previousPeriod = this.getPreviousPeriod(fromDate, toDate);

    const [currentData, previousData, totalIngresos, prevIngresos] = await Promise.all([
      this.getNominaData(fromDate, toDate),
      this.getNominaData(previousPeriod.from, previousPeriod.to),
      this.getTotalIngresos(fromDate, toDate),
      this.getTotalIngresos(previousPeriod.from, previousPeriod.to),
    ]);

    const totalBruto = currentData.totalBruto;
    const totalTax = currentData.totalTax;
    const totalNet = currentData.totalNet;

    const impactPercentage = totalIngresos > 0 ? Math.round((totalBruto / totalIngresos) * 100) : 0;
    const prevImpactPercentage = prevIngresos > 0 ? Math.round((previousData.totalBruto / prevIngresos) * 100) : 0;

    const trendBruto = this.calculateTrend(totalBruto, previousData.totalBruto);
    const trendImpact = this.calculateTrend(impactPercentage, prevImpactPercentage);

    const stats: StatCard[] = [
      {
        title: 'Gasto Salarial Bruto',
        value: currencyView === 'VES' ? this.formatCurrency(totalBruto * currentRate) : this.formatCurrency(totalBruto),
        trend: trendBruto.value,
        trendUp: trendBruto.isUp,
        color: 'primary',
      },
      {
        title: 'Retenciones/Impuestos',
        value: currencyView === 'VES' ? this.formatCurrency(totalTax * currentRate) : this.formatCurrency(totalTax),
        subText: 'Pasivo laboral',
        color: 'warning',
      },
      {
        title: 'Impacto sobre Ingresos',
        value: `${impactPercentage}%`,
        trend: trendImpact.value,
        trendUp: trendImpact.isUp,
        subText: 'Estructura de costos',
        color: impactPercentage > 50 ? 'danger' : impactPercentage > 30 ? 'warning' : 'success',
      },
    ];

    const table = currentData.groups.map(g => ({
      group: g.name,
      amount: currencyView === 'VES' ? g.amount * currentRate : g.amount,
      tax: currencyView === 'VES' ? g.tax * currentRate : g.tax,
      net: currencyView === 'VES' ? g.net * currentRate : g.net,
    }));

    return {
      message: 'Nómina encontrada',
      data: { stats, table },
    };
  }

  private static async getNominaData(from: Date, to: Date) {
    const payrolls = await prisma.payroll.findMany({
      where: {
        period_start: { gte: from },
        period_end: { lte: to },
      },
      include: {
        payrollLines: {
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
        },
      },
    });

    const groupData: Record<string, { amount: number; tax: number; net: number }> = {
      'Médicos Especialistas': { amount: 0, tax: 0, net: 0 },
      'Personal Enfermería': { amount: 0, tax: 0, net: 0 },
      'Administración': { amount: 0, tax: 0, net: 0 },
      'Servicios Generales': { amount: 0, tax: 0, net: 0 },
    };

    payrolls.forEach(payroll => {
      payroll.payrollLines.forEach(line => {
        if (!line.consultation?.doctor?.specialty) return;
        
        const baseAmount = Number(line.base_amount);
        const commission = Number(line.commission_percentage);
        const clinicAmount = baseAmount * (commission / 100);
        const tax = clinicAmount * 0.15;
        const net = clinicAmount - tax;

        const specialty = line.consultation.doctor.specialty.name.toLowerCase();

        if (specialty.includes('medicina') || specialty.includes('especialista') || specialty.includes('cirug') || specialty.includes('pedia') || specialty.includes('cardio')) {
          groupData['Médicos Especialistas'].amount += clinicAmount;
          groupData['Médicos Especialistas'].tax += tax;
          groupData['Médicos Especialistas'].net += net;
        } else if (specialty.includes('enfermería') || specialty.includes('enfermero') || specialty.includes('enfermera')) {
          groupData['Personal Enfermería'].amount += clinicAmount;
          groupData['Personal Enfermería'].tax += tax;
          groupData['Personal Enfermería'].net += net;
        } else if (specialty.includes('admin') || specialty.includes('recepc') || specialty.includes('contad')) {
          groupData['Administración'].amount += clinicAmount;
          groupData['Administración'].tax += tax;
          groupData['Administración'].net += net;
        } else {
          groupData['Servicios Generales'].amount += clinicAmount;
          groupData['Servicios Generales'].tax += tax;
          groupData['Servicios Generales'].net += net;
        }
      });
    });

    const totalBruto = Object.values(groupData).reduce((sum, g) => sum + g.amount, 0);
    const totalTax = Object.values(groupData).reduce((sum, g) => sum + g.tax, 0);
    const totalNet = Object.values(groupData).reduce((sum, g) => sum + g.net, 0);

    return {
      groups: Object.entries(groupData).map(([name, data]) => ({ name, ...data })),
      totalBruto,
      totalTax,
      totalNet,
    };
  }

  private static async getCurrentExchangeRate(): Promise<number> {
    const rate = await prisma.exchangeRate.findFirst({
      where: { is_active: true },
      orderBy: { createdAt: 'desc' },
    });
    return rate ? Number(rate.rate) : 1;
  }

  private static async getTotalPurchases(from: Date, to: Date): Promise<number> {
    const purchases = await prisma.purchase.findMany({
      where: { date: { gte: from, lte: to } },
      include: { items: true, exchangeRate: true },
    });

    return purchases.reduce((sum, p) => {
      return sum + p.items.reduce((itemSum, item) => itemSum + Number(item.unit_cost) * item.quantity, 0);
    }, 0);
  }

  private static async getTotalPayroll(from: Date, to: Date): Promise<number> {
    const payrolls = await prisma.payroll.findMany({
      where: {
        period_start: { gte: from },
        period_end: { lte: to },
      },
      include: { payrollLines: true },
    });

    return payrolls.reduce((sum, p) => {
      return sum + p.payrollLines.reduce((lineSum, line) => {
        const base = Number(line.base_amount);
        const pct = Number(line.commission_percentage) / 100;
        return lineSum + (base * pct);
      }, 0);
    }, 0);
  }

  private static async getTotalServices(from: Date, to: Date): Promise<number> {
    const expenses = await prisma.invoiceExpense.findMany({
      where: { date_at: { gte: from, lte: to } },
    });

    return expenses.reduce((sum, e) => sum + Number(e.total_amount), 0);
  }

  private static async getTotalOtherExpenses(from: Date, to: Date): Promise<number> {
    const expenses = await prisma.expensePayment.findMany({
      where: {
        date_at: { gte: from, lte: to },
      },
      include: {
        invoiceExpense: {
          include: { category: true },
        },
      },
    });

    const maintenanceCategory = expenses.filter(
      e => e.invoiceExpense.category.name.toLowerCase().includes('mantenimiento')
    );

    return maintenanceCategory.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  private static async getGastosAlerts(from: Date, to: Date, currentData?: any, previousData?: any): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const previousPeriod = this.getPreviousPeriod(from, to);
    const prevFrom = previousPeriod.from;
    const prevTo = previousPeriod.to;

    const [currentPurchases, previousPurchases, expiredSupplies, allExpenses] = await Promise.all([
      this.getTotalPurchases(from, to),
      this.getTotalPurchases(prevFrom, prevTo),
      prisma.supply.findMany({
        where: { is_perishable: true },
        include: { stockLots: { where: { expiration_date: { lte: to } } } },
      }),
      prisma.invoiceExpense.findMany({
        where: { date_at: { lte: to } },
        include: { payments: true },
      }),
    ]);

    const expiredCount = expiredSupplies.filter(s => s.stockLots.length > 0).length;
    if (expiredCount > 0) {
      alerts.push({
        type: 'warning',
        message: `${expiredCount} insumos próximos a vencer. Revisar inventario.`,
      });
    }

    const pendingPaymentsCount = allExpenses.filter(exp => {
      const paid = exp.payments.reduce((sum: number, p) => sum + Number(p.amount), 0);
      return Number(exp.total_amount) - paid > 0;
    }).length;

    if (pendingPaymentsCount > 5) {
      alerts.push({
        type: 'warning',
        message: `${pendingPaymentsCount} facturas pendientes de pago.`,
      });
    }

    if (previousPurchases > 0) {
      const increasePercent = ((currentPurchases - previousPurchases) / previousPurchases) * 100;
      if (increasePercent > 15) {
        alerts.push({
          type: 'danger',
          message: `Gastos en insumos aumentaron ${increasePercent.toFixed(1)}% vs mes anterior. Revisar proveedor.`,
        });
      }
    }

    return alerts;
  }

  private static formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}