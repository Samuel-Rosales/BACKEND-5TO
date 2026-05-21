import { Request, Response } from 'express';
import { z } from 'zod';
import { getExpenseSummarySchema } from './expenseSummary.validator';
import { ExpenseSummaryService } from './expenseSummary.service';

export class ExpenseSummaryController {
  public static async getSummary(req: Request, res: Response) {
    try {
      const validatedQuery = getExpenseSummarySchema.parse({ query: req.query }).query;
      const data = await ExpenseSummaryService.getSummary({
        from: validatedQuery.from,
        to: validatedQuery.to,
        period: validatedQuery.period,
      });
      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Error de validación en parámetros', errors: error.errors });
      }

      console.error('[ExpenseSummaryController.getSummary] Error:', error);
      return res.status(500).json({ message: 'Error interno al obtener el reporte de egresos', error: error.message });
    }
  }
}
