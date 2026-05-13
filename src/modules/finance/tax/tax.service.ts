import { prisma } from "@/configs";
import { CreateTaxDto, UpdateTaxDto } from "./tax.interface";

const taxSelect = {
    id: true,
    name: true,
    rate: true,
    code: true,
    isActive: true,
} as const;

export class TaxService {

    async create(data: CreateTaxDto) {
        try {
            const created = await prisma.tax.create({
                data,
                select: taxSelect,
            });

            return {
                status: 201,
                message: "Impuesto creado éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error creando el impuesto:", error);

            return {
                status: 500,
                message: "Error interno al crear el impuesto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const taxes = await prisma.tax.findMany({
                orderBy: { id: "desc" },
                select: taxSelect,
            });

            return {
                status: 200,
                message: taxes.length === 0 ? "No se encontraron impuestos" : "Impuestos encontrados éxitosamente",
                data: taxes,
            };
        } catch (error) {
            console.error("Error buscando impuestos:", error);

            return {
                status: 500,
                message: "Error interno al buscar impuestos",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const tax = await prisma.tax.findUnique({
                where: { id },
                select: taxSelect,
            });

            return {
                status: 200,
                message: "Impuesto encontrado éxitosamente",
                data: tax,
            };
        } catch (error) {
            console.error("Error buscando el impuesto:", error);

            return {
                status: 500,
                message: "Error interno al buscar el impuesto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateTaxDto) {
        try {
            const updated = await prisma.tax.update({
                where: { id },
                data,
                select: taxSelect,
            });

            return {
                status: 200,
                message: "Impuesto actualizado éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando el impuesto:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el impuesto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.tax.delete({
                where: { id },
                select: taxSelect,
            });

            return {
                status: 200,
                message: "Impuesto eliminado éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando el impuesto:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el impuesto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findFirstActive() {
        return prisma.tax.findFirst({
            where: { isActive: true },
            orderBy: { id: "desc" },
            select: taxSelect,
        });
    }
}
