import { z } from 'zod';

export const createSalaryPaymentSchema = z.object({
  body: z.object({
    payrollId: z.union([z.number(), z.string()]),
    userId: z.union([z.number(), z.string()]),
    amount: z.union([z.number(), z.string()]).optional(),
    concept: z.string().optional(),
    date_at: z.union([z.string(), z.date()]).optional(),
  }),
});

export const updateSalaryPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    payrollId: z.union([z.number(), z.string()]).optional(),
    userId: z.union([z.number(), z.string()]).optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    concept: z.string().optional(),
    date_at: z.union([z.string(), z.date()]).optional(),
  }),
});

export const getSalaryPaymentByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
});
