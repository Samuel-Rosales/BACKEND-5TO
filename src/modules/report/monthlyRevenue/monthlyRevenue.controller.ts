import { Request, Response } from 'express';
import { z } from 'zod';
import { getMonthlyRevenueSchema } from './monthlyRevenue.validator';
import { MonthlyRevenueService } from './monthlyRevenue.service';

export class MonthlyRevenueController {
	public static async getMonthlyRevenue(req: Request, res: Response) {
		try {
			const validatedQuery = getMonthlyRevenueSchema.parse({ query: req.query }).query;
			const data = await MonthlyRevenueService.getMonthlyRevenue({
				from: validatedQuery.from,
				to: validatedQuery.to,
				period: validatedQuery.period,
			});

			return res.status(200).json(data);
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					message: 'Error de validación en parámetros',
					errors: error.errors,
				});
			}

			console.error('[MonthlyRevenueController.getMonthlyRevenue] Error:', error);
			return res.status(500).json({
				message: 'Error interno al obtener el reporte mensual de ingresos',
				error: error.message,
			});
		}
	}
}
