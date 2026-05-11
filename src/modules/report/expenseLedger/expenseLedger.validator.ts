import { z } from 'zod';
import { ExpenseSource, CurrencyView, PayrollMode } from './expenseLedger.interface';

export const getExpenseLedgerSchema = z.object({
  query: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Use YYYY-MM-DD.'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Use YYYY-MM-DD.'),
    source: z.nativeEnum(ExpenseSource).optional().default(ExpenseSource.ALL),
    status: z.string().optional(),
    currencyView: z.nativeEnum(CurrencyView).optional().default(CurrencyView.USD),
    page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
    pageSize: z.preprocess((val) => (val ? Number(val) : 20), z.number().min(1).max(100).default(20)),
    payrollMode: z.nativeEnum(PayrollMode).optional().default(PayrollMode.ACCRUED),
  }),
});
