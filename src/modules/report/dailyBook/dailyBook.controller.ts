import { Request, Response } from 'express';
import { z } from 'zod';
import { getDailyBookSchema } from './dailyBook.validator';
import { DailyBookService } from './dailyBook.service';

export class DailyBookController {
  public static async getPdf(req: Request, res: Response) {
    try {
      const validated = getDailyBookSchema.parse({ query: req.query }).query;
      const now = new Date();
      const year = validated.year ?? now.getUTCFullYear();
      const month = validated.month ?? now.getUTCMonth() + 1;

      const pdf = await DailyBookService.generatePdf({ year, month });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="libro-diario-${year}-${String(month).padStart(2, '0')}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      return res.status(200).send(pdf);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Error de validación en parámetros', errors: error.errors });
      }

      console.error('[DailyBookController.getPdf] Error:', error);
      return res.status(500).json({ message: 'Error interno al generar el libro diario', error: error.message });
    }
  }
}
