import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { prisma } from '@/configs';
import { IncomeStatementSummary, IncomeStatementQueryRange } from './incomeStatement.interface';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const makeMonthRange = (year: number, month: number) => {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from, to };
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #cbd5e1',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
  },
  meta: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    padding: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottom: '0.5 solid #e2e8f0',
  },
  rowLabel: {
    color: '#334155',
    flex: 1,
  },
  rowValue: {
    color: '#334155',
    textAlign: 'right',
    width: 120,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: '#f8fafc',
    borderTop: '1 solid #cbd5e1',
    borderBottom: '1 solid #cbd5e1',
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    flex: 1,
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textAlign: 'right',
    width: 120,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#0f172a',
    marginTop: 8,
  },
  grandTotalLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    fontSize: 12,
    flex: 1,
  },
  grandTotalValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'right',
    width: 120,
  },
  profitPositive: {
    color: '#059669',
  },
  profitNegative: {
    color: '#dc2626',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 8,
  },
  infoBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8fafc',
    border: '0.5 solid #e2e8f0',
  },
  infoText: {
    fontSize: 8,
    color: '#64748b',
  },
});

interface IncomeStatementDocumentProps {
  year: number;
  month: number;
  summary: IncomeStatementSummary;
}

const t = (content: React.ReactNode, style?: unknown) => React.createElement(Text as any, { style }, content);
const v = (children: React.ReactNode[], style?: unknown) => React.createElement(View as any, { style }, ...children);

const IncomeStatementDocument = ({ year, month, summary }: IncomeStatementDocumentProps) => React.createElement(
  Document as any,
  null,
  React.createElement(
    Page as any,
    { size: 'A4', style: styles.page },
    v([
      t('VitalFe & Alegria', styles.title),
      t('Estado de Resultado', styles.subtitle),
      t(`Periodo: ${monthNames[month - 1]} ${year} | Generado: ${new Date().toLocaleDateString('es-VE')}`, styles.meta),
    ], styles.header),
    v([
      t('INGRESOS', styles.sectionTitle),
      v([
        t('Ingresos Brutos (Facturas)', styles.rowLabel),
        t(`$${summary.totalRevenueUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t('IGTF Recaudado', styles.rowLabel),
        t(`-$${summary.totalIgtfUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t('INGRESOS NETOS', styles.totalLabel),
        t(`$${summary.netRevenueUsd.toFixed(2)}`, styles.totalValue),
      ], styles.totalRow),
    ], styles.section),
    v([
      t('COSTO DE BIENES VENDIDOS', styles.sectionTitle),
      v([
        t('Compras de Insumos', styles.rowLabel),
        t(`$${summary.totalCogsUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t('TOTAL CBV', styles.totalLabel),
        t(`$${summary.totalCogsUsd.toFixed(2)}`, styles.totalValue),
      ], styles.totalRow),
    ], styles.section),
    v([
      t('UTILIDAD BRUTA', styles.totalLabel),
      t(`$${summary.grossProfitUsd.toFixed(2)}`, styles.totalValue),
    ], styles.totalRow),
    v([
      t('GASTOS OPERATIVOS', styles.sectionTitle),
      v([
        t('Nómina Médica', styles.rowLabel),
        t(`$${summary.medicalPayrollUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t('Nómina Administrativa', styles.rowLabel),
        t(`$${summary.adminPayrollUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t('Gastos por Servicios (OPEX)', styles.rowLabel),
        t(`$${summary.opexUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t('TOTAL GASTOS OPERATIVOS', styles.totalLabel),
        t(`$${summary.totalExpensesUsd.toFixed(2)}`, styles.totalValue),
      ], styles.totalRow),
    ], styles.section),
    v([
      t(summary.netProfitUsd < 0 ? 'PÉRDIDA NETA' : 'UTILIDAD NETA', styles.grandTotalLabel),
      t(`$${summary.netProfitUsd.toFixed(2)}`, styles.grandTotalValue),
    ], styles.grandTotalRow),
    v([
      t(`Resumen: ${summary.invoiceCount} facturas | ${summary.purchaseCount} compras | ${summary.entriesCount} asientos`, styles.infoText),
    ], styles.infoBox),
    t(`VitalFe & Alegria | Estado de Resultado | ${monthNames[month - 1]} ${year}`, styles.footer),
  )
);

export class IncomeStatementService {
  public static async generatePdf(query: IncomeStatementQueryRange): Promise<Buffer> {
    const { from, to } = makeMonthRange(query.year, query.month);

    const [invoices, purchases, payrollLines, salaryPayments, opexExpenses] = await Promise.all([
      prisma.invoice.findMany({
        where: { date_at: { gte: from, lte: to } },
        include: { payments: { include: { exchangeRate: true } } },
      }),
      prisma.purchase.findMany({
        where: { date: { gte: from, lte: to }, status: 'COMPLETED' },
        include: { items: true },
      }),
      prisma.payrollLine.findMany({
        where: { payroll: { period_start: { gte: from }, period_end: { lte: to } } },
        include: { payroll: true },
      }),
      prisma.salaryPayment.findMany({
        where: { date_at: { gte: from, lte: to } },
      }),
      prisma.invoiceExpense.findMany({
        where: { date_at: { gte: from, lte: to } },
      }),
    ]);

    const totalRevenueUsd = money(invoices.reduce((sum, inv) => sum + Number(inv.total_usd ?? 0), 0));
    const totalIgtfUsd = money(invoices.reduce((sum, inv) =>
      sum + inv.payments.reduce((pSum, p) => pSum + Number(p.igtf_amount ?? 0), 0), 0));
    const netRevenueUsd = money(totalRevenueUsd - totalIgtfUsd);

    const totalCogsUsd = money(purchases.reduce((sum, pur) =>
      sum + pur.items.reduce((iSum, item) => iSum + (Number(item.unit_cost) * Number(item.quantity)), 0), 0));

    const grossProfitUsd = money(netRevenueUsd - totalCogsUsd);

    const medicalPayrollUsd = money(payrollLines.reduce((sum, pl) => sum + Number(pl.base_amount ?? 0), 0));
    const adminPayrollUsd = money(salaryPayments.reduce((sum, sp) => sum + Number(sp.amount ?? 0), 0));
    const totalPayrollUsd = money(medicalPayrollUsd + adminPayrollUsd);

    const opexUsd = money(opexExpenses.reduce((sum, exp) => sum + Number(exp.total_amount ?? 0), 0));
    const totalExpensesUsd = money(totalPayrollUsd + opexUsd);

    const netProfitUsd = money(grossProfitUsd - totalExpensesUsd);

    const summary: IncomeStatementSummary = {
      totalRevenueUsd,
      totalIgtfUsd,
      netRevenueUsd,
      totalCogsUsd,
      grossProfitUsd,
      medicalPayrollUsd,
      adminPayrollUsd,
      totalPayrollUsd,
      opexUsd,
      totalExpensesUsd,
      netProfitUsd,
      invoiceCount: invoices.length,
      purchaseCount: purchases.length,
      entriesCount: invoices.length + purchases.length + payrollLines.length + salaryPayments.length + opexExpenses.length,
    };

    const doc = React.createElement(IncomeStatementDocument, { year: query.year, month: query.month, summary });
    const buffer = await renderToBuffer(doc);
    return buffer;
  }
}
