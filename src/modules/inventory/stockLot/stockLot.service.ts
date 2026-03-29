import { prisma } from "@/configs";
import { CreateStockLotDto, UpdateStockLotDto } from "./stockLot.interface";

const stockLotSelect = {
    id: true,
    quantity: true,
    supplyId: true,
    expiration_date: true,
    lot_cost: true,
    createdAt: true,
    supply: {
        select: {
            id: true,
            name: true,
            sku: true,
            active: true,
            categoryId: true,
            unitId: true,
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            unit: {
                select: {
                    id: true,
                    name: true,
                    symbol: true,
                },
            },
        },
    },
} as const;

export class StockLotService {

    async create(data: CreateStockLotDto) {
        try {
            const lot = await prisma.stockLot.create({
                data: {
                    quantity: data.quantity,
                    supplyId: data.supplyId,
                    expiration_date: data.expiration_date ? new Date(data.expiration_date) : undefined,
                    lot_cost: data.lot_cost as any,
                },
                select: stockLotSelect,
            });

            if (!lot) {
                throw new Error("Error creando el lote");
            }

            return {
                status: 201,
                message: "Lote creado éxitosamente",
                data: lot,
            };
        } catch (error) {
            console.error("Error creando el lote:", error);

            return {
                status: 500,
                message: "Error interno al crear el lote",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const lots = await prisma.stockLot.findMany({
                orderBy: { createdAt: "desc" },
                select: stockLotSelect,
            });

            if (!lots) {
                throw new Error("Error buscando lotes");
            }

            if (lots.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron lotes",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Lotes encontrados éxitosamente",
                data: lots,
            };
        } catch (error) {
            console.error("Error buscando lotes:", error);

            return {
                status: 500,
                message: "Error interno al buscar los lotes",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const lot = await prisma.stockLot.findUnique({
                where: { id },
                select: stockLotSelect,
            });

            if (!lot) {
                throw new Error("Error buscando el lote");
            }

            return {
                status: 200,
                message: "Lote encontrado éxitosamente",
                data: lot,
            };
        } catch (error) {
            console.error("Error buscando el lote:", error);

            return {
                status: 500,
                message: "Error interno al buscar el lote",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateStockLotDto) {
        try {
            const lot = await prisma.stockLot.update({
                where: { id },
                data: {
                    quantity: data.quantity,
                    supplyId: data.supplyId,
                    expiration_date: data.expiration_date ? new Date(data.expiration_date) : undefined,
                    lot_cost: data.lot_cost as any,
                },
                select: stockLotSelect,
            });

            if (!lot) {
                throw new Error("Error actualizando el lote");
            }

            return {
                status: 200,
                message: "Lote actualizado éxitosamente",
                data: lot,
            };
        } catch (error) {
            console.error("Error actualizando el lote:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el lote",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const lot = await prisma.stockLot.delete({
                where: { id },
                select: stockLotSelect,
            });

            if (!lot) {
                throw new Error("Error eliminando el lote");
            }

            return {
                status: 200,
                message: "Lote eliminado éxitosamente",
                data: lot,
            };
        } catch (error) {
            console.error("Error eliminando el lote:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el lote",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
