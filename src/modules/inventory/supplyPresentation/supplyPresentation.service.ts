import { prisma } from "@/configs";
import { CreateSupplyPresentationDto, UpdateSupplyPresentationDto } from "./supplyPresentation.interface";

const supplyPresentationSelect = {
    id: true,
    supplyId: true,
    name: true,
    factor: true,
    barCode: true,
    price: true,
    isActive: true,
    supply: {
        select: {
            id: true,
            name: true,
            sku: true,
            active: true,
        },
    },
} as const;

export class SupplyPresentationService {

    async create(data: CreateSupplyPresentationDto) {
        try {
            const created = await prisma.supplyPresentation.create({
                data: {
                    supplyId: data.supplyId,
                    name: data.name,
                    factor: data.factor as any,
                    barCode: data.barCode,
                    price: data.price as any,
                    isActive: data.isActive,
                },
                select: supplyPresentationSelect,
            });

            if (!created) {
                throw new Error("Error creando la presentación");
            }

            return {
                status: 201,
                message: "Presentación creada éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error creando la presentación:", error);

            return {
                status: 500,
                message: "Error interno al crear la presentación",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const items = await prisma.supplyPresentation.findMany({
                where: { isActive: true },
                orderBy: { id: "desc" },
                select: supplyPresentationSelect,
            });

            return {
                status: 200,
                message: items.length === 0 ? "No se encontraron presentaciones" : "Presentaciones encontradas éxitosamente",
                data: items,
            };
        } catch (error) {
            console.error("Error buscando presentaciones:", error);

            return {
                status: 500,
                message: "Error interno al buscar las presentaciones",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const item = await prisma.supplyPresentation.findUnique({
                where: { id },
                select: supplyPresentationSelect,
            });

            if (!item) {
                return {
                    status: 404,
                    message: "La presentación no existe",
                    data: null,
                    error: "Not Found",
                };
            }

            return {
                status: 200,
                message: "Presentación encontrada éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error buscando la presentación:", error);

            return {
                status: 500,
                message: "Error interno al buscar la presentación",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateSupplyPresentationDto) {
        try {
            const updated = await prisma.supplyPresentation.update({
                where: { id },
                data: {
                    supplyId: data.supplyId,
                    name: data.name,
                    factor: data.factor !== undefined ? (data.factor as any) : undefined,
                    barCode: data.barCode,
                    price: data.price !== undefined ? (data.price as any) : undefined,
                    isActive: data.isActive,
                },
                select: supplyPresentationSelect,
            });

            return {
                status: 200,
                message: "Presentación actualizada éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando la presentación:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la presentación",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.supplyPresentation.update({
                where: { id },
                data: { isActive: false },
                select: supplyPresentationSelect,
            });

            return {
                status: 200,
                message: "Presentación eliminada éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando la presentación:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la presentación",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
