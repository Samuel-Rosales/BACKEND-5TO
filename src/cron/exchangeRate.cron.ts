import cron from "node-cron";
import { ExchangeRateService } from "@/modules/finance/exchangeRate/exchangeRate.service";

export const startExchangeRateCron = () => {
    const service = new ExchangeRateService();

    cron.schedule(
        "30 8 * * *",
        async () => {
            try {
                const { status, message, error } = await service.syncBcv();
                if (status >= 400) {
                    console.error("[cron] BCV sync failed:", message, error);
                    return;
                }

                console.log("[cron] BCV sync ok:", message);
            } catch (err) {
                console.error("[cron] BCV sync error:", err);
            }
        },
        {
            timezone: "America/Caracas",
        }
    );
};
