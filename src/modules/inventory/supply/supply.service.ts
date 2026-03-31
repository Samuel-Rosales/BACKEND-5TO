import { prisma } from "@/configs";
import { CreateSupplyDto, UpdateSupplyDto } from "./supply.interface";

const supplySelect = {
    id: true,
    name: true,
    sku: true,
    description: true,
    cost_price: true,
    min_stock: true,
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
} as const;

export class SupplyService {

    async create(data: CreateSupplyDto) {
        try {
            const supply = await prisma.supply.create({
                data,
                select: supplySelect,
            });

            if (!supply) {
                throw new Error("Error creando el insumo");
            }

            return {
                status: 201,
                message: "Insumo creado éxitosamente",
                data: supply,
            };
        } catch (error) {
            console.error("Error creando el insumo:", error);

            return {
                status: 500,
                message: "Error interno al crear el insumo",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const supplies = await prisma.supply.findMany({
                where: { active: true },
                orderBy: { id: "desc" },
                select: supplySelect,
            });

            if (!supplies) {
                throw new Error("Error buscando supplies");
            }

            if (supplies.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron supplies",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Insumos encontrados éxitosamente",
                data: supplies,
            };
        } catch (error) {
            console.error("Error buscando supplies:", error);

            return {
                status: 500,
                message: "Error interno al buscar los supplies",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const supply = await prisma.supply.findUnique({
                where: { id, active: true },
                select: supplySelect,
            });

            if (!supply) {
                throw new Error("Error buscando el insumo");
            }

            return {
                status: 200,
                message: "Insumo encontrado éxitosamente",
                data: supply,
            };
        } catch (error) {
            console.error("Error buscando el insumo:", error);

            return {
                status: 500,
                message: "Error interno al buscar el insumo",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateSupplyDto) {
        try {
            const supply = await prisma.supply.update({
                where: { id, active: true },
                data,
                select: supplySelect,
            });

            if (!supply) {
                throw new Error("Error actualizando el insumo");
            }

            return {
                status: 200,
                message: "Insumo actualizado éxitosamente",
                data: supply,
            };
        } catch (error) {
            console.error("Error actualizando el insumo:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el insumo",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const supply = await prisma.supply.update({
                where: { id, active: true },
                data: { active: false },
                select: supplySelect,
            });

            if (!supply) {
                throw new Error("Error eliminando el insumo");
            }

            return {
                status: 200,
                message: "Insumo eliminado éxitosamente",
                data: supply,
            };
        } catch (error) {
            console.error("Error eliminando el insumo:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el insumo",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
