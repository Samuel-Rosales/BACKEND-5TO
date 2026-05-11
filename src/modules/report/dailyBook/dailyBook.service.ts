import fs from 'fs';
import path from 'path';
import PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
import { prisma } from '@/configs';
import { DailyBookLine, DailyBookQueryRange, DailyBookSummary } from './dailyBook.interface';

const pad2 = (value: number) => String(value).padStart(2, '0');
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const resolveLogoPath = () => {
  const candidates = [
    path.resolve(process.cwd(), '..', 'FRONTEND-5TO', 'src', 'assets', 'clinicasintext.svg'),
    path.resolve(process.cwd(), '..', '..', 'FRONTEND-5TO', 'src', 'assets', 'clinicasintext.svg'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
};

const formatDate = (date: Date) => `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;

const makeMonthRange = (year: number, month: number) => {
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from, to };
};

const addLine = (lines: DailyBookLine[], line: DailyBookLine) => {
  lines.push(line);
};

const addEntryLines = (lines: DailyBookLine[], entryLines: DailyBookLine[]) => {
  lines.push(...entryLines);
};

const createBalancedEntry = (params: {
  date: Date;
  entryId: string;
  source: DailyBookLine['source'];
  sourceId: number;
  reference: string;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
  amount: number;
  detail: string;
}): DailyBookLine[] => {
  const date = formatDate(params.date);
  const amount = money(params.amount);

  return [
    {
      date,
      entryId: params.entryId,
      source: params.source,
      sourceId: params.sourceId,
      reference: params.reference,
      accountCode: params.debitAccountCode,
      accountName: params.debitAccountName,
      type: 'DEBIT',
      debit: amount,
      credit: 0,
      detail: params.detail,
    },
    {
      date,
      entryId: params.entryId,
      source: params.source,
      sourceId: params.sourceId,
      reference: params.reference,
      accountCode: params.creditAccountCode,
      accountName: params.creditAccountName,
      type: 'CREDIT',
      debit: 0,
      credit: amount,
      detail: params.detail,
    },
  ];
};

const getInvoices = async (from: Date, to: Date): Promise<DailyBookLine[]> => {
  const invoices = await prisma.invoice.findMany({
    where: { date_at: { gte: from, lte: to } },
    include: {
      consultation: {
        include: {
          doctor: { include: { specialty: true } },
        },
      },
      patient: { include: { user: true } },
    },
    orderBy: { date_at: 'asc' },
  });

  const lines: DailyBookLine[] = [];

  for (const invoice of invoices) {
    const specialtyId = invoice.consultation?.doctor?.specialty?.id ?? 0;
    const specialtyName = invoice.consultation?.doctor?.specialty?.name ?? 'Sin especialidad';
    const amount = Number(invoice.total_usd ?? 0);
    const date = invoice.date_at ?? new Date();
    const entryId = `INV-${invoice.id}`;

    addEntryLines(lines, createBalancedEntry({
      date,
      entryId,
      source: 'INCOME',
      sourceId: invoice.id,
      reference: `Factura #${invoice.id}`,
      debitAccountCode: '1101.01',
      debitAccountName: 'Banco',
      creditAccountCode: `4105.${String(specialtyId).padStart(2, '0')}`,
      creditAccountName: `Ingresos ${specialtyName}`,
      amount,
      detail: `Ingreso por consulta ${specialtyName}${invoice.patient?.user?.name ? ` - ${invoice.patient.user.name}` : ''}`,
    }));
  }

  return lines;
};

const getPurchases = async (from: Date, to: Date): Promise<DailyBookLine[]> => {
  const purchases = await prisma.purchase.findMany({
    where: { date: { gte: from, lte: to } },
    include: {
      supplier: true,
      items: { include: { supply: { include: { category: true } } } },
    },
    orderBy: { date: 'asc' },
  });

  const lines: DailyBookLine[] = [];
  for (const purchase of purchases) {
    const amount = money(purchase.items.reduce((sum, item) => sum + Number(item.unit_cost) * Number(item.quantity), 0));
    if (!amount) continue;
    const detailCategories = [...new Set(purchase.items.map((item) => item.supply.category.name))].join(', ') || 'Insumos';
    addEntryLines(lines, createBalancedEntry({
      date: purchase.date ?? new Date(),
      entryId: `PUR-${purchase.id}`,
      source: 'PURCHASE',
      sourceId: purchase.id,
      reference: purchase.reference ? `Compra ${purchase.reference}` : `Compra #${purchase.id}`,
      debitAccountCode: '5101.01',
      debitAccountName: 'Compras e insumos',
      creditAccountCode: '1101.01',
      creditAccountName: 'Banco',
      amount,
      detail: `${purchase.supplier.name} - ${detailCategories}`,
    }));
  }

  return lines;
};

const getOpex = async (from: Date, to: Date): Promise<DailyBookLine[]> => {
  const expenses = await prisma.invoiceExpense.findMany({
    where: { date_at: { gte: from, lte: to } },
    include: { category: true, supplier: true },
    orderBy: { date_at: 'asc' },
  });

  const lines: DailyBookLine[] = [];
  for (const expense of expenses) {
    const amount = money(Number(expense.total_amount ?? 0));
    addEntryLines(lines, createBalancedEntry({
      date: expense.date_at ?? new Date(),
      entryId: `OPEX-${expense.id}`,
      source: 'OPEX',
      sourceId: expense.id,
      reference: `Gasto ${expense.id}`,
      debitAccountCode: '5104.01',
      debitAccountName: `Gastos por servicios - ${expense.category.name}`,
      creditAccountCode: '1101.01',
      creditAccountName: 'Banco',
      amount,
      detail: expense.supplier.name,
    }));
  }

  return lines;
};

const getPayroll = async (from: Date, to: Date): Promise<DailyBookLine[]> => {
  const payrollLines = await prisma.payrollLine.findMany({
    where: {
      payroll: { period_start: { gte: from }, period_end: { lte: to } },
    },
    include: {
      payroll: true,
      consultation: { include: { doctor: { include: { user: true, specialty: true } } } },
    },
    orderBy: { id: 'asc' },
  });

  const salaryPayments = await prisma.salaryPayment.findMany({
    where: { date_at: { gte: from, lte: to } },
    include: { payroll: true, user: { include: { role: true } } },
    orderBy: { id: 'asc' },
  });

  const lines: DailyBookLine[] = [];

  for (const line of payrollLines) {
    const amount = money(Number(line.base_amount ?? 0));
    addEntryLines(lines, createBalancedEntry({
      date: line.payroll.period_end,
      entryId: `PAY-${line.id}`,
      source: 'PAYROLL',
      sourceId: line.id,
      reference: `Nómina ${line.payroll.id}`,
      debitAccountCode: '5102.01',
      debitAccountName: 'Nómina médica',
      creditAccountCode: '1101.01',
      creditAccountName: 'Banco',
      amount,
      detail: line.consultation.doctor.user.name,
    }));
  }

  for (const payment of salaryPayments) {
    const amount = money(Number(payment.amount ?? 0));
    addEntryLines(lines, createBalancedEntry({
      date: payment.date_at ?? payment.payroll.period_end,
      entryId: `SAL-${payment.id}`,
      source: 'SALARY',
      sourceId: payment.id,
      reference: `Salario ${payment.id}`,
      debitAccountCode: '5103.01',
      debitAccountName: 'Nómina administrativa',
      creditAccountCode: '1101.01',
      creditAccountName: 'Banco',
      amount,
      detail: `${payment.user.name} - ${payment.user.role.name}`,
    }));
  }

  return lines;
};

const sortLines = (lines: DailyBookLine[]) => lines.sort((a, b) => {
  const dayDiff = a.date.localeCompare(b.date);
  if (dayDiff !== 0) return dayDiff;
  if (a.entryId !== b.entryId) return a.entryId.localeCompare(b.entryId);
  return a.type.localeCompare(b.type);
});

const buildPdf = async (range: DailyBookQueryRange, lines: DailyBookLine[], summary: DailyBookSummary) => {
  const doc = new PDFDocument({ size: 'A4', margin: 36, bufferPages: true });
  const chunks: Buffer[] = [];
  const pdfReady = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const logoPath = resolveLogoPath();
  const logoSvg = logoPath ? fs.readFileSync(logoPath, 'utf8').replace(/currentColor/g, '#0f766e') : null;

  const tableTop = 170;
  const pageWidth = 523;
  const widths = [55, 70, 165, 70, 70, 73];
  const headers = ['Fecha', 'Cód.', 'Cuenta', 'Referencia', 'Debe', 'Haber'];

  const renderHeader = () => {
    if (logoSvg) {
      SVGtoPDF(doc, logoSvg, 36, 32, { width: 56, height: 56, assumePt: true });
    }

    doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('VitalFe & Alegria', 100, 36);
    doc.fontSize(13).font('Helvetica-Bold').text('Libro Diario', 100, 55);
    doc.fontSize(10).font('Helvetica').fillColor('#475569').text(
      `Periodo: ${monthNames[range.month - 1]} ${range.year}`,
      100,
      74
    );
    doc.text(`Emitido: ${new Date().toLocaleDateString('es-VE')}`, 100, 89);
    doc.moveTo(36, 112).lineTo(559, 112).strokeColor('#cbd5e1').stroke();
  };

  const renderTableHeader = () => {
    let x = 36;
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a');
    doc.rect(36, tableTop, pageWidth, 20).fill('#dbeafe').stroke('#cbd5e1');
    headers.forEach((header, index) => {
      doc.text(header, x + 4, tableTop + 6, { width: widths[index] - 8, align: index >= 4 ? 'right' : 'left' });
      x += widths[index];
    });
  };

  const ensureSpace = (y: number) => {
    if (y > 720) {
      doc.addPage();
      renderHeader();
      renderTableHeader();
      return tableTop + 20;
    }
    return y;
  };

  renderHeader();
  renderTableHeader();

  let y = tableTop + 20;
  let currentEntry = '';
  let currentDate = '';

  for (const line of lines) {
    y = ensureSpace(y);
    if (line.entryId !== currentEntry) {
      currentEntry = line.entryId;
      currentDate = line.date;
      y += 2;
    }

    const cells = [
      line.date === currentDate ? line.date : '',
      line.accountCode,
      `${line.accountName}${line.detail ? ` - ${line.detail}` : ''}`,
      line.reference,
      line.debit ? money(line.debit).toFixed(2) : '',
      line.credit ? money(line.credit).toFixed(2) : '',
    ];

    let x = 36;
    doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
    const rowHeight = 18;
    doc.rect(36, y, pageWidth, rowHeight).strokeColor('#e2e8f0').stroke();
    cells.forEach((cell, index) => {
      doc.text(String(cell), x + 4, y + 5, {
        width: widths[index] - 8,
        align: index >= 4 ? 'right' : 'left',
        ellipsis: true,
      });
      x += widths[index];
    });
    y += rowHeight;
  }

  y += 8;
  doc.moveTo(36, y).lineTo(559, y).strokeColor('#cbd5e1').stroke();
  y += 12;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
  doc.text(`Totales Debe: ${summary.totalDebit.toFixed(2)} USD`, 36, y);
  doc.text(`Totales Haber: ${summary.totalCredit.toFixed(2)} USD`, 250, y);
  doc.text(`Movimientos: ${summary.linesCount}`, 430, y);

  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i += 1) {
    doc.switchToPage(i);
    const footerY = 780;
    doc.fontSize(8).fillColor('#64748b').text(
      `VitalFe & Alegria · Libro Diario · ${monthNames[range.month - 1]} ${range.year}`,
      36,
      footerY,
      { align: 'center', width: 523 }
    );
    doc.text(`Página ${i + 1} de ${pages.count}`, 36, footerY + 10, { align: 'center', width: 523 });
  }

  doc.end();

  return pdfReady;
};

export class DailyBookService {
  public static async generatePdf(query: DailyBookQueryRange) {
    const { from, to } = makeMonthRange(query.year, query.month);

    const [incomeLines, purchaseLines, opexLines, payrollLines] = await Promise.all([
      getInvoices(from, to),
      getPurchases(from, to),
      getOpex(from, to),
      getPayroll(from, to),
    ]);

    const lines = sortLines([...incomeLines, ...purchaseLines, ...opexLines, ...payrollLines]);
    const summary: DailyBookSummary = {
      incomeUsd: money(incomeLines.filter((line) => line.type === 'CREDIT').reduce((sum, line) => sum + line.credit, 0)),
      purchasesUsd: money(purchaseLines.filter((line) => line.type === 'DEBIT').reduce((sum, line) => sum + line.debit, 0)),
      payrollUsd: money(payrollLines.filter((line) => line.source === 'PAYROLL').reduce((sum, line) => sum + line.debit, 0)),
      salaryUsd: money(payrollLines.filter((line) => line.source === 'SALARY').reduce((sum, line) => sum + line.debit, 0)),
      opexUsd: money(opexLines.filter((line) => line.type === 'DEBIT').reduce((sum, line) => sum + line.debit, 0)),
      totalDebit: money(lines.reduce((sum, line) => sum + line.debit, 0)),
      totalCredit: money(lines.reduce((sum, line) => sum + line.credit, 0)),
      entriesCount: new Set(lines.map((line) => line.entryId)).size,
      linesCount: lines.length,
    };

    return buildPdf({ year: query.year, month: query.month }, lines, summary);
  }
}
