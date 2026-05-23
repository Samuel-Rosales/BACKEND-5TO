import fs from 'fs';
import path from 'path';
import React from 'react';
import { prisma } from '@/configs';
import { IncomeStatementSummary, IncomeStatementQueryRange } from './incomeStatement.interface';

type PdfRenderer = any;

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

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

const makeMonthRange = (year: number, month: number) => {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from, to };
};

const createStyles = (StyleSheet: PdfRenderer['StyleSheet']) => StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '1 solid #cbd5e1',
    paddingBottom: 10,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 15,
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
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 8,
  },
});

interface IncomeStatementDocumentProps {
  year: number;
  month: number;
  summary: IncomeStatementSummary;
  logoDataUri: string | null; 
}

const t = (Text: any, content: React.ReactNode, style?: unknown) => React.createElement(Text, { style }, content);
const v = (View: any, children: React.ReactNode[], style?: unknown) => React.createElement(View, { style }, ...children);

const createIncomeStatementDocument = (pdf: PdfRenderer, styles: ReturnType<typeof createStyles>) => ({ year, month, summary, logoDataUri }: IncomeStatementDocumentProps) => React.createElement(
  pdf.Document as any,
  null,
  React.createElement(
    pdf.Page as any,
    { size: 'A4', style: styles.page },
    v([
      logoDataUri 
        ? React.createElement(pdf.Image as any, {
            src: logoDataUri,
            style: { width: 56, height: 56 }
          })
        : null,
      
      v([
        t(pdf.Text, 'VitalFe & Alegria', styles.title),
        t(pdf.Text, 'Estado de Resultado', styles.subtitle),
        t(pdf.Text, `Periodo: ${monthNames[month - 1]} ${year} | Generado: ${new Date().toLocaleDateString('es-VE')}`, styles.meta),
      ], styles.headerTextContainer),
    ], styles.header),

    v([
      t(pdf.Text, 'INGRESOS', styles.sectionTitle),
      v([
        t(pdf.Text, 'Ingresos Brutos (Facturas)', styles.rowLabel),
        t(pdf.Text, `$${summary.totalRevenueUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t(pdf.Text, 'IGTF Recaudado', styles.rowLabel),
        t(pdf.Text, `-$${summary.totalIgtfUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t(pdf.Text, 'INGRESOS NETOS', styles.totalLabel),
        t(pdf.Text, `$${summary.netRevenueUsd.toFixed(2)}`, styles.totalValue),
      ], styles.totalRow),
    ], styles.section),
    v([
      t(pdf.Text, 'COSTO DE BIENES VENDIDOS', styles.sectionTitle),
      v([
        t(pdf.Text, 'Compras de Insumos', styles.rowLabel),
        t(pdf.Text, `$${summary.totalCogsUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t(pdf.Text, 'TOTAL CBV', styles.totalLabel),
        t(pdf.Text, `$${summary.totalCogsUsd.toFixed(2)}`, styles.totalValue),
      ], styles.totalRow),
    ], styles.section),
    v([
      t(pdf.Text, 'UTILIDAD BRUTA', styles.totalLabel),
      t(pdf.Text, `$${summary.grossProfitUsd.toFixed(2)}`, styles.totalValue),
    ], styles.totalRow),
    v([
      t(pdf.Text, 'GASTOS OPERATIVOS', styles.sectionTitle),
      v([
        t(pdf.Text, 'Nómina Médica', styles.rowLabel),
        t(pdf.Text, `$${summary.medicalPayrollUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t(pdf.Text, 'Nómina Administrativa', styles.rowLabel),
        t(pdf.Text, `$${summary.adminPayrollUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t(pdf.Text, 'Gastos por Servicios (OPEX)', styles.rowLabel),
        t(pdf.Text, `$${summary.opexUsd.toFixed(2)}`, styles.rowValue),
      ], styles.row),
      v([
        t(pdf.Text, 'TOTAL GASTOS OPERATIVOS', styles.totalLabel),
        t(pdf.Text, `$${summary.totalExpensesUsd.toFixed(2)}`, styles.totalValue),
      ], styles.totalRow),
    ], styles.section),
    v([
      t(pdf.Text, summary.netProfitUsd < 0 ? 'PÉRDIDA NETA' : 'UTILIDAD NETA', styles.grandTotalLabel),
      t(pdf.Text, `$${summary.netProfitUsd.toFixed(2)}`, styles.grandTotalValue),
    ], styles.grandTotalRow),
    v([
      t(pdf.Text, `Resumen: ${summary.invoiceCount} facturas | ${summary.purchaseCount} compras | ${summary.entriesCount} asientos`, styles.infoText),
    ], styles.infoBox),
    t(pdf.Text, `VitalFe & Alegria | Estado de Resultado | ${monthNames[month - 1]} ${year}`, styles.footer),
  )
);

export class IncomeStatementService {
  public static async generatePdf(query: IncomeStatementQueryRange): Promise<Buffer> {
    const { from, to } = makeMonthRange(query.year, query.month);

    // ─── CAMBIO: Obtenemos el URI base64 ───
    const logoDataUri = resolveLogoBase64();

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

    const pdf = await import('@react-pdf/renderer');
    const styles = createStyles(pdf.StyleSheet);
    const doc = React.createElement(createIncomeStatementDocument(pdf, styles), { year: query.year, month: query.month, summary, logoDataUri });
    return await pdf.renderToBuffer(doc as React.ReactElement<any>);
  }
}