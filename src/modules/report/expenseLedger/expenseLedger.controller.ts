import { Request, Response } from 'express';
import { ExpenseLedgerService } from './expenseLedger.service';
import { getExpenseLedgerSchema } from './expenseLedger.validator';
import { z } from 'zod';

export class ExpenseLedgerController {
  public static async getLedger(req: Request, res: Response) {
    try {
      const validatedQuery = getExpenseLedgerSchema.parse({ query: req.query }).query;

      const data = await ExpenseLedgerService.getLedger(validatedQuery);

      res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Error de validación en parámetros',
          errors: error.errors,
        });
      }

      console.error('[ExpenseLedgerController.getLedger] Error:', error);
      res.status(500).json({
        message: 'Error interno al obtener consolidado de egresos',
        error: error.message,
      });
    }
  }
}
