import axios from "axios";
import { prisma } from "@/configs";
import { CreateExchangeRateDto, UpdateExchangeRateDto } from "./exchangeRate.interface";

type BcvRate = {
    moneda: string;
    fecha: string;
    fecha_iso: string;
    valor: {
        valor_str: string;
        valor_num: number;
    };
};

const exchangeRateSelect = {
    id: true,
    rate: true,
    createdAt: true,
    is_active: true,
} as const;

export class ExchangeRateService {

    private bcvUrl = "https://api-bcv-pi.vercel.app/api/tasa/usd";

    private normalizeRateValue(raw: unknown, rawString: unknown): number {
        if (typeof raw === "number" && Number.isFinite(raw)) return raw;
        if (typeof rawString === "string") {
            const normalized = rawString.replace(/\./g, "").replace(/,/g, ".").trim();
            const value = Number(normalized);
            if (Number.isFinite(value)) return value;
        }
        return NaN;
    }

    private async fetchBcvRate(): Promise<BcvRate> {
        const response = await axios.get(this.bcvUrl, { timeout: 10000 });
        const payload = response?.data;

        if (!payload || typeof payload !== "object") {
            throw new Error("Respuesta BCV invalida");
        }

        const valorRaw = (payload as any)?.valor?.valor_num;
        const valorStr = (payload as any)?.valor?.valor_str;
        const valorNum = this.normalizeRateValue(valorRaw, valorStr);

        if (!Number.isFinite(valorNum) || valorNum <= 0) {
            throw new Error("Valor BCV invalido");
        }

        return {
            moneda: String((payload as any)?.moneda ?? "USD"),
            fecha: String((payload as any)?.fecha ?? ""),
            fecha_iso: String((payload as any)?.fecha_iso ?? ""),
            valor: {
                valor_str: String(valorStr ?? valorNum),
                valor_num: valorNum,
            },
        };
    }

    async create(data: CreateExchangeRateDto) {
        try {
            const shouldBeActive = data.is_active !== false;

            const created = await prisma.$transaction(async (tx) => {
                if (shouldBeActive) {
                    await tx.exchangeRate.updateMany({
                        where: { is_active: true },
                        data: { is_active: false },
                    });
                }

                return tx.exchangeRate.create({
                    data: {
                        rate: data.rate,
                        is_active: shouldBeActive,
                    },
                    select: exchangeRateSelect,
                });
            });

            return {
                status: 201,
                message: "Tasa de cambio creada éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error creando la tasa de cambio:", error);

            return {
                status: 500,
                message: "Error interno al crear la tasa de cambio",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const rates = await prisma.exchangeRate.findMany({
                orderBy: { createdAt: "desc" },
                select: exchangeRateSelect,
            });

            return {
                status: 200,
                message: rates.length === 0 ? "No se encontraron tasas de cambio" : "Tasas de cambio encontradas éxitosamente",
                data: rates,
            };
        } catch (error) {
            console.error("Error buscando tasas de cambio:", error);

            return {
                status: 500,
                message: "Error interno al buscar las tasas de cambio",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const rate = await prisma.exchangeRate.findUnique({
                where: { id },
                select: exchangeRateSelect,
            });

            return {
                status: 200,
                message: "Tasa de cambio encontrada éxitosamente",
                data: rate,
            };
        } catch (error) {
            console.error("Error buscando la tasa de cambio:", error);

            return {
                status: 500,
                message: "Error interno al buscar la tasa de cambio",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateExchangeRateDto) {
        try {
            const updated = await prisma.$transaction(async (tx) => {
                if (data.is_active === true) {
                    await tx.exchangeRate.updateMany({
                        where: { is_active: true },
                        data: { is_active: false },
                    });
                }

                return tx.exchangeRate.update({
                    where: { id },
                    data,
                    select: exchangeRateSelect,
                });
            });

            return {
                status: 200,
                message: "Tasa de cambio actualizada éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando la tasa de cambio:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la tasa de cambio",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.exchangeRate.delete({
                where: { id },
                select: exchangeRateSelect,
            });

            return {
                status: 200,
                message: "Tasa de cambio eliminada éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando la tasa de cambio:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la tasa de cambio",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findActive() {
        return prisma.exchangeRate.findFirst({
            where: { is_active: true },
            orderBy: { createdAt: "desc" },
            select: exchangeRateSelect,
        });
    }

    async fetchBcv() {
        try {
            const bcv = await this.fetchBcvRate();

            return {
                status: 200,
                message: "Tasa BCV obtenida",
                data: bcv,
            };
        } catch (error) {
            console.error("Error consultando tasa BCV:", error);

            return {
                status: 500,
                message: "Error interno al consultar la tasa BCV",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async syncBcv() {
        try {
            const bcv = await this.fetchBcvRate();
            const activeRate = await prisma.exchangeRate.findFirst({
                where: { is_active: true },
                orderBy: { createdAt: "desc" },
                select: exchangeRateSelect,
            });

            const currentValue = activeRate ? Number(activeRate.rate) : null;
            const newValue = Number(bcv.valor.valor_num);
            const isSame = currentValue !== null && Math.abs(currentValue - newValue) < 0.0001;

            if (isSame) {
                return {
                    status: 200,
                    message: "Tasa BCV sin cambios",
                    data: {
                        changed: false,
                        rate: activeRate,
                        bcv,
                    },
                };
            }

            const created = await prisma.$transaction(async (tx) => {
                await tx.exchangeRate.updateMany({
                    where: { is_active: true },
                    data: { is_active: false },
                });

                return tx.exchangeRate.create({
                    data: {
                        rate: newValue,
                        is_active: true,
                    },
                    select: exchangeRateSelect,
                });
            });

            return {
                status: 200,
                message: "Tasa BCV actualizada",
                data: {
                    changed: true,
                    rate: created,
                    bcv,
                },
            };
        } catch (error) {
            console.error("Error sincronizando tasa BCV:", error);

            return {
                status: 500,
                message: "Error interno al sincronizar la tasa BCV",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
