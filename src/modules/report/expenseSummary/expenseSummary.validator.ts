import { z } from 'zod';

export const getExpenseSummarySchema = z.object({
  query: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Use YYYY-MM-DD.').optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Use YYYY-MM-DD.').optional(),
  }),
});
