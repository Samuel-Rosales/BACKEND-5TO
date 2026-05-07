import { z } from 'zod';

export const commonQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
  currencyView: z.enum(['USD', 'VES']).optional().default('USD'),
});

export function validateCommonQuery(query: unknown) {
  return commonQuerySchema.parse(query);
}