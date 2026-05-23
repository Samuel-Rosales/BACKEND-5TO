import { Request, Response } from 'express';
import { z } from 'zod';
import { getIncomeSummarySchema } from './incomeSummary.validator';
import { IncomeSummaryService } from './incomeSummary.service';

export class IncomeSummaryController {
  public static async getSummary(req: Request, res: Response) {
    try {
      const validatedQuery = getIncomeSummarySchema.parse({ query: req.query }).query;
      const data = await IncomeSummaryService.getSummary({
        from: validatedQuery.from,
        to: validatedQuery.to,
      });

      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }

      console.error('[IncomeSummaryController.getSummary] Error:', error);
      return res.status(500).json({
        message: 'Error interno al obtener el reporte de ingresos',
        error: error.message,
      });
    }
  }

	public static async getPdf(req: Request, res: Response) {
		try {
			const validatedQuery = getIncomeSummarySchema.parse({ query: req.query }).query;
			const pdf = await IncomeSummaryService.generatePdf({
				from: validatedQuery.from,
				to: validatedQuery.to,
			});

			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', `inline; filename="reporte-ingresos-${new Date().toISOString().slice(0, 10)}.pdf"`);
			res.setHeader('Content-Length', pdf.length);
			return res.status(200).send(pdf);
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: 'Error de validación en parámetros', errors: error.errors });
			}

			console.error('[IncomeSummaryController.getPdf] Error:', error);
			return res.status(500).json({ message: 'Error al generar el PDF de ingresos', error: error.message });
		}
	}
}
