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
    type: true,
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
                select: { 
                    id: true,
                    name: true,
                    sku: true,
                    description: true,
                    cost_price: true,
                    min_stock: true,
                    type: true,
                    category: {
                        select: {
                            name: true,
                        },
                    },
                    unit: {
                        select: {
                            name: true,
                            symbol: true,
                        },
                    },
                    stockLots: {
                        select: {
                            id: true,
                            quantity: true,
                            expiration_date: true,
                        },
                    },
                },
            });

            if (!supplies) {
                throw new Error("Error buscando insumos");
            }

            if (supplies.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron insumos",
                    data: [],
                };
            }

            const formattedSupplies = supplies.map(supply => {
                const sumStock = supply.stockLots.reduce((sum, lot) => sum + lot.quantity, 0);
                const inferredType = supply.type ?? (supply.sku?.toUpperCase().startsWith("MED-") ? "Medicamento" : "Material");

                return {
                    ...supply,
                    type: inferredType,
                    stock: sumStock,
                };
            });

            return {
                status: 200,
                message: "Insumos encontrados éxitosamente",
                data: formattedSupplies,
            };
        } catch (error) {
            console.error("Error buscando insumos:", error);

            return {
                status: 500,
                message: "Error interno al buscar los insumos",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const supply = await prisma.supply.findUnique({
                where: { id, active: true },
                select: { 
                    id: true,
                    name: true,
                    sku: true,
                    description: true,
                    cost_price: true,
                    min_stock: true,
                    type: true,
                    category: {
                        select: {
                            name: true,
                        },
                    },
                    unit: {
                        select: {
                            name: true,
                            symbol: true,
                        },
                    },
                    stockLots: {
                        select: {
                            id: true,
                            quantity: true,
                            expiration_date: true,
                        },
                    },
                },
            });

            if (!supply) {
                throw new Error("Error buscando el insumo");
            }

            const sumStock = supply.stockLots.reduce((sum, lot) => sum + lot.quantity, 0);
            const inferredType = supply.type ?? (supply.sku?.toUpperCase().startsWith("MED-") ? "Medicamento" : "Material");

            return {
                status: 200,
                message: "Insumo encontrado éxitosamente",
                data: { ...supply, type: inferredType, stock: sumStock },
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
