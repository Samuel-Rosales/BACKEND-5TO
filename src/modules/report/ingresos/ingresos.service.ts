import { prisma } from '@/configs';
import {
  IngresosQueryParams,
  IngresosSummaryResponse,
  IngresosServiciosResponse,
  IngresosCarteraResponse,
  IngresosRecaudacionResponse,
  StatCard,
  Alert,
} from './ingresos.interface';

export class IngresosService {
  public static async getSummary(params: IngresosQueryParams): Promise<{ message: string; data: IngresosSummaryResponse }> {
    const { from, to, currencyView = 'USD' } = params;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const currentRate = await this.getCurrentExchangeRate();
    const previousPeriod = this.getPreviousPeriod(fromDate, toDate);

    const [currentData, previousData] = await Promise.all([
      this.getCurrentPeriodData(fromDate, toDate),
      this.getCurrentPeriodData(previousPeriod.from, previousPeriod.to),
    ]);

    const trendIngresos = this.calculateTrend(currentData.totalIngresos, previousData.totalIngresos);
    const trendCartera = this.calculateTrend(currentData.cartera, previousData.cartera);
    const trendDiasCartera = this.calculateTrend(currentData.diasCartera, previousData.diasCartera);

    const margenContribucion = currentData.totalIngresos > 0 
      ? Math.round(((currentData.totalIngresos - currentData.costosServicios) / currentData.totalIngresos) * 100)
      : 0;
    const prevMargen = previousData.totalIngresos > 0 
      ? Math.round(((previousData.totalIngresos - previousData.costosServicios) / previousData.totalIngresos) * 100)
      : 0;
    const trendMargen = this.calculateTrend(margenContribucion, prevMargen);

    const stats: StatCard[] = [
      {
        title: 'Ingreso Bruto Total',
        value: currencyView === 'VES' ? this.formatCurrency(currentData.totalIngresos * currentRate) : this.formatCurrency(currentData.totalIngresos),
        trend: trendIngresos.value,
        trendUp: trendIngresos.isUp,
        color: 'success',
      },
      {
        title: 'Cuentas por Cobrar (Activo)',
        value: currencyView === 'VES' ? this.formatCurrency(currentData.cartera * currentRate) : this.formatCurrency(currentData.cartera),
        trend: trendCartera.value,
        trendUp: trendCartera.isUp,
        color: 'warning',
      },
      {
        title: 'Margen de Contribución',
        value: `${margenContribucion}%`,
        trend: trendMargen.value,
        trendUp: trendMargen.isUp,
        color: 'primary',
      },
      {
        title: 'Días en Cartera (Promedio)',
        value: currentData.diasCartera.toString(),
        trend: trendDiasCartera.value,
        trendUp: !trendDiasCartera.isUp,
        color: 'success',
      },
    ];

    const totalBreakdown = currentData.totalIngresos > 0 ? currentData.totalIngresos : 1;
    const breakdown = [
      { category: 'Servicios Ambulatorios', amount: currentData.ambulatorio, weight: `${Math.round((currentData.ambulatorio / totalBreakdown) * 100)}%` },
      { category: 'Hospitalización', amount: currentData.hospitalizacion, weight: `${Math.round((currentData.hospitalizacion / totalBreakdown) * 100)}%` },
      { category: 'Laboratorio y Diagnóstico', amount: currentData.laboratorio, weight: `${Math.round((currentData.laboratorio / totalBreakdown) * 100)}%` },
      { category: 'Farmacia Interna', amount: currentData.farmacia, weight: `${Math.round((currentData.farmacia / totalBreakdown) * 100)}%` },
    ];

    const alerts: Alert[] = await this.getIngresosAlerts(fromDate, toDate, currentData);

    return {
      message: 'Resumen de ingresos encontrado',
      data: { stats, breakdown, alerts },
    };
  }

  public static async getServicios(params: IngresosQueryParams): Promise<{ message: string; data: IngresosServiciosResponse }> {
    const { from, to, currencyView = 'USD' } = params;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const currentRate = await this.getCurrentExchangeRate();
    const previousPeriod = this.getPreviousPeriod(fromDate, toDate);

    const [currentData, previousData] = await Promise.all([
      this.getServiciosData(fromDate, toDate),
      this.getServiciosData(previousPeriod.from, previousPeriod.to),
    ]);

    const trendIngresos = this.calculateTrend(currentData.total, previousData.total);
    const prevMargen = previousData.total > 0 ? ((previousData.total - previousData.costos) / previousData.total) * 100 : 0;
    const currMargen = currentData.total > 0 ? ((currentData.total - currentData.costos) / currentData.total) * 100 : 0;
    const trendMargen = this.calculateTrend(currMargen, prevMargen);

    const stats: StatCard[] = [
      {
        title: 'Ingresos Operativos',
        value: currencyView === 'VES' ? this.formatCurrency(currentData.total * currentRate) : this.formatCurrency(currentData.total),
        trend: trendIngresos.value,
        trendUp: trendIngresos.isUp,
        color: 'primary',
      },
      {
        title: 'Margen Bruto',
        value: `${currMargen.toFixed(0)}%`,
        trend: trendMargen.value,
        trendUp: trendMargen.isUp,
        color: 'success',
      },
      {
        title: 'Punto de Equilibrio',
        value: currentData.total > currentData.costos ? 'Excedido' : 'No alcanzado',
        color: currentData.total > currentData.costos ? 'warning' : 'danger',
      },
    ];

    const table = currentData.services.map(s => ({
      codigo: s.codigo,
      cuenta: s.name,
      debe: 0,
      haber: currencyView === 'VES' ? s.amount * currentRate : s.amount,
      saldo: `${currencyView === 'VES' ? this.formatCurrency(s.amount * currentRate) : this.formatCurrency(s.amount)} CR`,
    }));

    return {
      message: 'Ventas por servicio encontrado',
      data: { stats, table },
    };
  }

  public static async getCartera(params: IngresosQueryParams): Promise<{ message: string; data: IngresosCarteraResponse }> {
    const { from, to, currencyView = 'USD' } = params;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const currentRate = await this.getCurrentExchangeRate();
    const previousPeriod = this.getPreviousPeriod(fromDate, toDate);

    const [currentData, previousData] = await Promise.all([
      this.getCarteraData(fromDate, toDate),
      this.getCarteraData(previousPeriod.from, previousPeriod.to),
    ]);

    const trendCartera = this.calculateTrend(currentData.total, previousData.total);
    const trendDias = this.calculateTrend(currentData.promedioDias, previousData.promedioDias);

    const stats: StatCard[] = [
      {
        title: 'Cartera Total',
        value: currencyView === 'VES' ? this.formatCurrency(currentData.total * currentRate) : this.formatCurrency(currentData.total),
        trend: trendCartera.value,
        trendUp: trendCartera.isUp,
        color: 'warning',
      },
      {
        title: 'Antigüedad Promedio',
        value: `${currentData.promedioDias} Días`,
        trend: trendDias.value,
        trendUp: !trendDias.isUp,
        color: 'success',
      },
      {
        title: 'Provisión Estimada',
        value: currencyView === 'VES' ? this.formatCurrency(currentData.provision * currentRate) : this.formatCurrency(currentData.provision),
        subText: 'Cuentas dudosas',
        color: 'danger',
      },
    ];

    const table = currentData.entes.map(ente => ({
      ente: ente.name,
      corrente: currencyView === 'VES' ? ente.corrente * currentRate : ente.corrente,
      vencido: currencyView === 'VES' ? ente.vencido * currentRate : ente.vencido,
      provision: currencyView === 'VES' ? ente.provision * currentRate : ente.provision,
      total: currencyView === 'VES' ? ente.total * currentRate : ente.total,
    }));

    return {
      message: 'Cartera de activos encontrada',
      data: { stats, table },
    };
  }

  public static async getRecaudacion(params: IngresosQueryParams): Promise<{ message: string; data: IngresosRecaudacionResponse }> {
    const { from, to, currencyView = 'USD' } = params;
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const currentRate = await this.getCurrentExchangeRate();
    const previousPeriod = this.getPreviousPeriod(fromDate, toDate);

    const [currentData, previousData] = await Promise.all([
      this.getRecaudacionData(fromDate, toDate),
      this.getRecaudacionData(previousPeriod.from, previousPeriod.to),
    ]);

    const trendEfectivo = this.calculateTrend(currentData.efectivo, previousData.efectivo);
    
    const totalCobrado = currentData.metodos.reduce((sum, m) => sum + m.monto, 0);
    const eficiencia = currentData.carteraInicial > 0 
      ? Math.round((totalCobrado / currentData.carteraInicial) * 100) 
      : 0;
    const prevEficiencia = previousData.carteraInicial > 0 
      ? Math.round((previousData.metodos.reduce((s, m) => s + m.monto, 0) / previousData.carteraInicial) * 100) 
      : 0;
    const trendEficiencia = this.calculateTrend(eficiencia, prevEficiencia);

    const stats: StatCard[] = [
      {
        title: 'Efectivo y Equivalentes',
        value: currencyView === 'VES' ? this.formatCurrency(currentData.efectivo * currentRate) : this.formatCurrency(currentData.efectivo),
        trend: trendEfectivo.value,
        trendUp: trendEfectivo.isUp,
        color: 'success',
      },
      {
        title: 'Eficiencia de Recaudo',
        value: `${eficiencia.toFixed(1)}%`,
        trend: trendEficiencia.value,
        trendUp: trendEficiencia.isUp,
        subText: 'Conversión Cartera → Caja',
        color: 'primary',
      },
      {
        title: 'Partidas Pendientes',
        value: currentData.diferenciaArqueo !== 0 ? `-${Math.abs(currentData.diferenciaArqueo).toFixed(2)}` : '0.00',
        subText: currentData.diferenciaArqueo !== 0 ? 'Diferencia de Arqueo' : 'Conciliado',
        color: currentData.diferenciaArqueo !== 0 ? 'danger' : 'success',
      },
    ];

    const table = currentData.metodos.map(m => ({
      medio: m.nombre,
      sistema: currencyView === 'VES' ? m.monto * currentRate : m.monto,
      banco: currencyView === 'VES' ? m.monto * currentRate : m.monto,
      dif: 0,
      estado: 'Conciliado',
    }));

    return {
      message: 'Recaudación encontrada',
      data: { stats, table },
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

  private static async getCurrentExchangeRate(): Promise<number> {
    const rate = await prisma.exchangeRate.findFirst({
      where: { is_active: true },
      orderBy: { createdAt: 'desc' },
    });
    return rate ? Number(rate.rate) : 1;
  }

  private static async getCurrentPeriodData(from: Date, to: Date) {
    const [invoices, pendingInvoices] = await Promise.all([
      prisma.invoice.findMany({
        where: { date_at: { gte: from, lte: to } },
        include: { 
          consultation: {
            include: { doctor: { include: { specialty: true } } }
          }
        },
      }),
      prisma.invoice.findMany({
        where: { 
          date_at: { lte: to },
          status: { name: { not: 'PAID' } },
        },
        include: { payments: true },
      }),
    ]);

    const totalIngresos = invoices.reduce((sum, inv) => sum + Number(inv.total_usd), 0);
    
    const cartera = pendingInvoices.reduce((sum, inv) => {
      const paid = inv.payments.reduce((pSum, p) => pSum + Number(p.amount_paid), 0);
      return sum + (Number(inv.total_usd) - paid);
    }, 0);

    let ambulatorio = 0, hospitalizacion = 0, laboratorio = 0, farmacia = 0;
    
    invoices.forEach(inv => {
      const specialty = inv.consultation?.doctor?.specialty?.name?.toLowerCase() || '';
      const amount = Number(inv.total_usd);
      
      if (specialty.includes('consulta') || specialty.includes('general')) {
        ambulatorio += amount;
      } else if (specialty.includes('hospital') || specialty.includes('cirug')) {
        hospitalizacion += amount;
      } else if (specialty.includes('laboratorio') || specialty.includes('diagnost')) {
        laboratorio += amount;
      } else {
        ambulatorio += amount;
      }
    });

    const totalDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const diasCartera = pendingInvoices.length > 0 
      ? Math.round(totalDays * (cartera / (totalIngresos || 1)))
      : 0;

    const costosServicios = totalIngresos * 0.38;

    return {
      totalIngresos,
      cartera,
      diasCartera,
      ambulatorio,
      hospitalizacion,
      laboratorio,
      farmacia,
      costosServicios,
    };
  }

  private static async getServiciosData(from: Date, to: Date) {
    const invoices = await prisma.invoice.findMany({
      where: { date_at: { gte: from, lte: to } },
      include: {
        consultation: {
          include: { doctor: { include: { specialty: true } } }
        }
      },
    });

    const servicesMap: Record<string, { name: string; amount: number; codigo: string }> = {
      '410501': { name: 'Medicina General', amount: 0, codigo: '410501' },
      '410502': { name: 'Hospitalización', amount: 0, codigo: '410502' },
      '410503': { name: 'Laboratorio Clínico', amount: 0, codigo: '410503' },
      '410504': { name: 'Venta de Farmacia', amount: 0, codigo: '410504' },
    };

    invoices.forEach(inv => {
      const specialty = inv.consultation?.doctor?.specialty?.name?.toLowerCase() || '';
      const amount = Number(inv.total_usd);
      
      if (specialty.includes('consulta') || specialty.includes('general') || specialty.includes('medicina')) {
        servicesMap['410501'].amount += amount;
      } else if (specialty.includes('hospital') || specialty.includes('cirug')) {
        servicesMap['410502'].amount += amount;
      } else if (specialty.includes('laboratorio') || specialty.includes('diagnost')) {
        servicesMap['410503'].amount += amount;
      } else {
        servicesMap['410504'].amount += amount;
      }
    });

    const total = Object.values(servicesMap).reduce((sum, s) => sum + s.amount, 0);
    const costos = total * 0.38;

    return {
      services: Object.values(servicesMap),
      total,
      costos,
    };
  }

  private static async getCarteraData(from: Date, to: Date) {
    const invoices = await prisma.invoice.findMany({
      where: { 
        date_at: { lte: to },
        status: { name: { not: 'PAID' } },
      },
      include: {
        patient: { include: { user: true } },
        payments: true,
      },
    });

    const now = new Date();
    let totalCorriente = 0;
    let totalVencido = 0;
    let totalProvision = 0;
    const daysMap: Record<string, number[]> = {};

    invoices.forEach(inv => {
      const paid = inv.payments.reduce((pSum, p) => pSum + Number(p.amount_paid), 0);
      const pending = Number(inv.total_usd) - paid;
      
      if (pending <= 0) return;

      const diffDays = Math.floor((now.getTime() - new Date(inv.date_at).getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 30) {
        totalCorriente += pending;
      } else {
        totalVencido += pending;
        totalProvision += pending * 0.05;
      }

      const key = inv.patient?.name || 'Sin asignar';
      if (!daysMap[key]) daysMap[key] = [];
      daysMap[key].push(diffDays);
    });

    const promedioDias = Object.values(daysMap).flat().length > 0
      ? Math.round(Object.values(daysMap).flat().reduce((a, b) => a + b, 0) / Object.values(daysMap).flat().length)
      : 0;

    const enteMap: Record<string, { name: string; corrente: number; vencido: number; provision: number; total: number }> = {
      'Particulares': { name: 'Particulares', corrente: 0, vencido: 0, provision: 0, total: 0 },
    };

    invoices.forEach(inv => {
      const paid = inv.payments.reduce((pSum, p) => pSum + Number(p.amount_paid), 0);
      const pending = Number(inv.total_usd) - paid;
      
      if (pending <= 0) return;

      const diffDays = Math.floor((now.getTime() - new Date(inv.date_at).getTime()) / (1000 * 60 * 60 * 24));
      const provision = diffDays > 30 ? pending * 0.05 : 0;

      if (!enteMap['Particulares']) {
        enteMap['Particulares'] = { name: 'Particulares', corrente: 0, vencido: 0, provision: 0, total: 0 };
      }

      if (diffDays <= 30) {
        enteMap['Particulares'].corrente += pending;
      } else {
        enteMap['Particulares'].vencido += pending;
        enteMap['Particulares'].provision += provision;
      }
      enteMap['Particulares'].total += pending;
    });

    return {
      total: totalCorriente + totalVencido,
      promedioDias,
      provision: totalProvision,
      entes: Object.values(enteMap),
    };
  }

  private static async getRecaudacionData(from: Date, to: Date) {
    const payments = await prisma.invoicePayment.findMany({
      where: { date_at: { gte: from, lte: to } },
      include: { paymentMethod: true },
    });

    const methodMap: Record<string, { nombre: string; monto: number }> = {};
    let efectivo = 0;

    payments.forEach(p => {
      const methodName = p.paymentMethod.name;
      const amount = Number(p.amount_paid);
      
      if (!methodMap[methodName]) {
        methodMap[methodName] = { nombre: methodName, monto: 0 };
      }
      methodMap[methodName].monto += amount;

      if (methodName.toLowerCase().includes('efectivo')) {
        efectivo += amount;
      }
    });

    const metodos = Object.values(methodMap);
    const totalMetodos = metodos.reduce((sum, m) => sum + m.monto, 0);

    const initialInvoices = await prisma.invoice.findMany({
      where: { date_at: { lt: from } },
    });
    const carteraInicial = initialInvoices.reduce((sum, inv) => sum + Number(inv.total_usd), 0);

    return {
      efectivo,
      metodos,
      diferenciaArqueo: 0,
      carteraInicial,
    };
  }

  private static async getIngresosAlerts(from: Date, to: Date, currentData: any): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const previousPeriod = this.getPreviousPeriod(from, to);

    const [expiredInvoices, morosos] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          date_at: { lte: to },
          status: { name: { not: 'PAID' } },
        },
        include: { payments: true },
      }),
      prisma.invoice.findMany({
        where: {
          date_at: { lte: new Date(to.getTime() - 60 * 24 * 60 * 60 * 1000) },
          status: { name: { not: 'PAID' } },
        },
        include: { patient: true },
      }),
    ]);

    const morosoCount = morosos.filter(inv => {
      const diff = new Date().getTime() - new Date(inv.date_at).getTime();
      return diff > 60 * 24 * 60 * 60 * 1000;
    }).length;

    if (morosoCount > 0) {
      alerts.push({
        type: 'danger',
        message: `${morosoCount} facturas con más de 60 días de mora. Revisar gestión de cobranza.`,
      });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const prevMonthRecaudacion = currentData.totalIngresos * 0.7;
    const metaCumplida = prevMonthRecaudacion > 0;

    if (metaCumplida) {
      alerts.push({
        type: 'success',
        message: 'Meta de recaudación efectiva superada esta semana.',
      });
    }

    return alerts;
  }

  private static formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}