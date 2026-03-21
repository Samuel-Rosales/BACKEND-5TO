import { prisma } from "@/configs";
import { CreateExchangeRateDto, UpdateExchangeRateDto } from "./exchangeRate.interface";

const exchangeRateSelect = {
    id: true,
    rate: true,
    createdAt: true,
    is_active: true,
} as const;

export class ExchangeRateService {

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
}
