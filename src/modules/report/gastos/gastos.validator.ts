import { z } from 'zod';

export const commonReportQuerySchema = z.object({
  query: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe tener formato YYYY-MM-DD'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe tener formato YYYY-MM-DD'),
    groupBy: z.enum(['day', 'week', 'month']).optional(),
    currencyView: z.enum(['USD', 'VES']).optional(),
  }).refine((data) => {
    const fromDate = new Date(data.from);
    const toDate = new Date(data.to);
    return fromDate <= toDate;
  }, {
    message: 'La fecha de inicio debe ser menor o igual a la fecha de fin',
    path: ['from'],
  }),
});

export function validateCommonQuery(query: unknown) {
  return commonReportQuerySchema.parse({ query });
}