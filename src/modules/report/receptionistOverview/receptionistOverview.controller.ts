import { Request, Response } from 'express';
import { ReceptionistOverviewService } from './receptionistOverview.service';

export class ReceptionistOverviewController {
	public static async getOverview(_req: Request, res: Response) {
		try {
			const data = await ReceptionistOverviewService.getOverview();
			return res.status(200).json(data);
		} catch (error: any) {
			console.error('[ReceptionistOverviewController.getOverview] Error:', error);
			return res.status(500).json({
				message: 'Error interno al obtener el resumen de recepción',
				error: error.message,
			});
		}
	}
}
