import { Request, Response } from 'express';
import { z } from 'zod';
import { OperativosService } from './operativos.service';

const reportQuerySchema = z.object({
	query: z.object({
		from: z.string().optional(),
		to: z.string().optional(),
		period: z.enum(['day', 'week', 'month', 'year']).optional(),
	}),
});

export class OperativosController {
	public static async getOverview(req: Request, res: Response) {
		try {
			const validatedQuery = reportQuerySchema.parse({ query: req.query }).query;
			const data = await OperativosService.getOverview(validatedQuery);
			return res.status(200).json(data);
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					message: 'Error de validación en parámetros',
					errors: error.errors,
				});
			}

			console.error('[OperativosController.getOverview] Error:', error);
			return res.status(500).json({
				message: 'Error interno al obtener el resumen operativo',
				error: error.message,
			});
		}
	}

	public static async getCitas(req: Request, res: Response) {
		try {
			const validatedQuery = reportQuerySchema.parse({ query: req.query }).query;
			const data = await OperativosService.getCitas(validatedQuery);
			return res.status(200).json(data);
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					message: 'Error de validación en parámetros',
					errors: error.errors,
				});
			}

			console.error('[OperativosController.getCitas] Error:', error);
			return res.status(500).json({
				message: 'Error interno al obtener el reporte de citas',
				error: error.message,
			});
		}
	}

	public static async getTiempos(req: Request, res: Response) {
		try {
			const validatedQuery = reportQuerySchema.parse({ query: req.query }).query;
			const data = await OperativosService.getTiempos(validatedQuery);
			return res.status(200).json(data);
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					message: 'Error de validación en parámetros',
					errors: error.errors,
				});
			}

			console.error('[OperativosController.getTiempos] Error:', error);
			return res.status(500).json({
				message: 'Error interno al obtener el reporte de tiempos',
				error: error.message,
			});
		}
	}

	public static async getProductividad(req: Request, res: Response) {
		try {
			const validatedQuery = reportQuerySchema.parse({ query: req.query }).query;
			const data = await OperativosService.getProductividad(validatedQuery);
			return res.status(200).json(data);
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					message: 'Error de validación en parámetros',
					errors: error.errors,
				});
			}

			console.error('[OperativosController.getProductividad] Error:', error);
			return res.status(500).json({
				message: 'Error interno al obtener el reporte de productividad',
				error: error.message,
			});
		}
	}
}
