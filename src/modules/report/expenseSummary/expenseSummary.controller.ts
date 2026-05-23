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

	public static async getPdf(req: Request, res: Response) {
		try {
			const validatedQuery = getExpenseSummarySchema.parse({ query: req.query }).query;
			const pdf = await ExpenseSummaryService.generatePdf({
				from: validatedQuery.from,
				to: validatedQuery.to,
				period: validatedQuery.period,
			});

			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', `inline; filename="reporte-egresos-${new Date().toISOString().slice(0, 10)}.pdf"`);
			res.setHeader('Content-Length', pdf.length);
			return res.status(200).send(pdf);
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: 'Error de validación en parámetros', errors: error.errors });
			}

			console.error('[ExpenseSummaryController.getPdf] Error:', error);
			return res.status(500).json({ message: 'Error al generar el PDF de egresos', error: error.message });
		}
	}
}
