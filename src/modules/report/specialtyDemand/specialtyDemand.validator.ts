import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado YYYY-MM-DD');

export const getSpecialtyDemandSchema = z.object({
	query: z.object({
		from: dateString.optional(),
		to: dateString.optional(),
	}),
});
