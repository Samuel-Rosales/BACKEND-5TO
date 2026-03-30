import { prisma } from "@/configs";
import type { Prisma, PrismaClient } from "@prisma/client";

export type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Resolves an exchange rate to be used by services.
 *
 * Rules:
 * - If `exchangeRateId` is provided, returns that record (or throws if not found).
 * - Otherwise, returns the most recent active rate.
 * - If none is active, returns the most recent registered rate.
 */
export async function resolveExchangeRate(exchangeRateId?: number, db: DbClient = prisma) {
    if (exchangeRateId) {
        const rate = await db.exchangeRate.findUnique({ where: { id: exchangeRateId } });
        if (!rate) throw new Error("La tasa de cambio no existe");
        return rate;
    }

    const active = await db.exchangeRate.findFirst({
        where: { is_active: true },
        orderBy: { createdAt: "desc" },
    });

    if (active) return active;

    const latest = await db.exchangeRate.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!latest) throw new Error("No existe ninguna tasa de cambio registrada");

    return latest;
}
