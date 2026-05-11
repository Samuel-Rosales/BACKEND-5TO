import { Request, Response } from 'express';
import { z } from 'zod';
import { createSalaryPaymentSchema, getSalaryPaymentByIdSchema, updateSalaryPaymentSchema } from './salaryPayment.validator';
import { SalaryPaymentService } from './salaryPayment.service';

export class SalaryPaymentController {
  public static async create(req: Request, res: Response) {
    try {
      const validated = createSalaryPaymentSchema.parse({ body: req.body }).body;
      const result = await new SalaryPaymentService().create(validated);
      return res.status(result.status).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Error de validación', errors: error.errors });
      }
      return res.status(500).json({ message: 'Error interno al crear pago salarial', error: error.message });
    }
  }

  public static async findAll(_req: Request, res: Response) {
    const result = await new SalaryPaymentService().findAll();
    return res.status(result.status).json(result);
  }

  public static async findOne(req: Request, res: Response) {
    try {
      const validated = getSalaryPaymentByIdSchema.parse({ params: req.params }).params;
      const result = await new SalaryPaymentService().findOne(Number(validated.id));
      return res.status(result.status).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Error de validación', errors: error.errors });
      }
      return res.status(500).json({ message: 'Error interno al buscar pago salarial', error: error.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const validated = updateSalaryPaymentSchema.parse({ params: req.params, body: req.body });
      const result = await new SalaryPaymentService().update(Number(validated.params.id), validated.body);
      return res.status(result.status).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Error de validación', errors: error.errors });
      }
      return res.status(500).json({ message: 'Error interno al actualizar pago salarial', error: error.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const validated = getSalaryPaymentByIdSchema.parse({ params: req.params }).params;
      const result = await new SalaryPaymentService().delete(Number(validated.id));
      return res.status(result.status).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Error de validación', errors: error.errors });
      }
      return res.status(500).json({ message: 'Error interno al eliminar pago salarial', error: error.message });
    }
  }
}
