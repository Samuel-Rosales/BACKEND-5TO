import { Request, Response } from 'express';
import { ExchangeRateService } from '@/modules/finance/exchangeRate/exchangeRate.service';

export async function exchangeRateCron(req: Request, res: Response) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const service = new ExchangeRateService();
        const result = await service.syncBcv();

        if (result.status >= 400) {
            console.error('[cron] BCV sync failed:', result.message, result.error);
            res.status(result.status).json({
                success: false,
                message: result.message,
                error: result.error
            });
            return;
        }

        console.log('[cron] BCV sync ok:', result.message);
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('[cron] BCV sync error:', err);
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}