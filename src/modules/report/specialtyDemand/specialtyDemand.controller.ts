import { Request, Response } from 'express';
import { z } from 'zod';
import { getSpecialtyDemandSchema } from './specialtyDemand.validator';
import { SpecialtyDemandService } from './specialtyDemand.service';

export class SpecialtyDemandController {
	public static async getSpecialtyDemand(req: Request, res: Response) {
		try {
			const validatedQuery = getSpecialtyDemandSchema.parse({ query: req.query }).query;
			const data = await SpecialtyDemandService.getSpecialtyDemand({
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

			console.error('[SpecialtyDemandController.getSpecialtyDemand] Error:', error);
			return res.status(500).json({
				message: 'Error interno al obtener la demanda por especialidad',
				error: error.message,
			});
		}
	}
}
