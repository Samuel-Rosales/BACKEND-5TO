import { Request, Response } from 'express';
import { z } from 'zod';
import { getIncomeStatementSchema } from './incomeStatement.validator';
import { IncomeStatementService } from './incomeStatement.service';

export class IncomeStatementController {
  public static async getPdf(req: Request, res: Response) {
    try {
      const validated = getIncomeStatementSchema.parse({ query: req.query }).query;
      const now = new Date();
      const year = validated.year ?? now.getUTCFullYear();
      const month = validated.month ?? now.getUTCMonth() + 1;

      const pdf = await IncomeStatementService.generatePdf({ year, month });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="estado-resultado-${year}-${String(month).padStart(2, '0')}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      return res.status(200).send(pdf);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Error de validación en parámetros', errors: error.errors });
      }

      console.error('[IncomeStatementController.getPdf] Error:', error);
      return res.status(500).json({ message: 'Error interno al generar el estado de resultado', error: error.message });
    }
  }
}