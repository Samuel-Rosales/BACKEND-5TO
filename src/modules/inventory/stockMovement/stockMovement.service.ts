import { prisma } from "@/configs";
import { CreateStockMovementDto, UpdateStockMovementDto } from "./stockMovement.interface";

const stockMovementSelect = {
    id: true,
    supplyId: true,
    stockLotId: true,
    userId: true,
    type: true,
    quantity: true,
    reason: true,
    date: true,
    supply: {
        select: {
            id: true,
            name: true,
            sku: true,
            active: true,
        },
    },
    stockLot: {
        select: {
            id: true,
            supplyId: true,
            quantity: true,
            expiration_date: true,
            lot_cost: true,
            createdAt: true,
        },
    },
    user: {
        select: {
            id: true,
            ci: true,
            name: true,
            roleId: true,
            active: true,
        },
    },
} as const;

export class StockMovementService {

    async create(data: CreateStockMovementDto) {
        try {
            const movement = await prisma.stockMovement.create({
                data: {
                    supplyId: data.supplyId,
                    stockLotId: data.stockLotId,
                    userId: data.userId,
                    type: data.type,
                    quantity: data.quantity,
                    reason: data.reason,
                    date: data.date ? new Date(data.date) : undefined,
                },
                select: stockMovementSelect,
            });

            if (!movement) {
                throw new Error("Error creando el movimiento");
            }

            return {
                status: 201,
                message: "Movimiento creado éxitosamente",
                data: movement,
            };
        } catch (error) {
            console.error("Error creando el movimiento:", error);

            return {
                status: 500,
                message: "Error interno al crear el movimiento",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const movements = await prisma.stockMovement.findMany({
                orderBy: { date: "desc" },
                select: stockMovementSelect,
            });

            if (!movements) {
                throw new Error("Error buscando movimientos");
            }

            if (movements.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron movimientos",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Movimientos encontrados éxitosamente",
                data: movements,
            };
        } catch (error) {
            console.error("Error buscando movimientos:", error);

            return {
                status: 500,
                message: "Error interno al buscar los movimientos",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const movement = await prisma.stockMovement.findUnique({
                where: { id },
                select: stockMovementSelect,
            });

            if (!movement) {
                throw new Error("Error buscando el movimiento");
            }

            return {
                status: 200,
                message: "Movimiento encontrado éxitosamente",
                data: movement,
            };
        } catch (error) {
            console.error("Error buscando el movimiento:", error);

            return {
                status: 500,
                message: "Error interno al buscar el movimiento",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateStockMovementDto) {
        try {
            const movement = await prisma.stockMovement.update({
                where: { id },
                data: {
                    supplyId: data.supplyId,
                    stockLotId: data.stockLotId,
                    userId: data.userId,
                    type: data.type,
                    quantity: data.quantity,
                    reason: data.reason,
                    date: data.date ? new Date(data.date) : undefined,
                },
                select: stockMovementSelect,
            });

            if (!movement) {
                throw new Error("Error actualizando el movimiento");
            }

            return {
                status: 200,
                message: "Movimiento actualizado éxitosamente",
                data: movement,
            };
        } catch (error) {
            console.error("Error actualizando el movimiento:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el movimiento",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const movement = await prisma.stockMovement.delete({
                where: { id },
                select: stockMovementSelect,
            });

            if (!movement) {
                throw new Error("Error eliminando el movimiento");
            }

            return {
                status: 200,
                message: "Movimiento eliminado éxitosamente",
                data: movement,
            };
        } catch (error) {
            console.error("Error eliminando el movimiento:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el movimiento",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
