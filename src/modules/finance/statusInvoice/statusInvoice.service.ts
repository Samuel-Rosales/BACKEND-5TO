import { prisma } from "@/configs";
import { CreateStatusInvoiceDto, UpdateStatusInvoiceDto } from "./statusInvoice.interface";

const statusInvoiceSelect = {
    id: true,
    name: true,
    color_hex: true,
} as const;

export class StatusInvoiceService {

    async create(data: CreateStatusInvoiceDto) {
        try {
            const created = await prisma.statusInvoice.create({
                data,
                select: statusInvoiceSelect,
            });

            return {
                status: 201,
                message: "Status de factura creado éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error creando el status de factura:", error);

            return {
                status: 500,
                message: "Error interno al crear el status de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const statuses = await prisma.statusInvoice.findMany({
                orderBy: { id: "desc" },
                select: statusInvoiceSelect,
            });

            return {
                status: 200,
                message: statuses.length === 0 ? "No se encontraron status de factura" : "Status de factura encontrados éxitosamente",
                data: statuses,
            };
        } catch (error) {
            console.error("Error buscando status de factura:", error);

            return {
                status: 500,
                message: "Error interno al buscar status de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const status = await prisma.statusInvoice.findUnique({
                where: { id },
                select: statusInvoiceSelect,
            });

            return {
                status: 200,
                message: "Status de factura encontrado éxitosamente",
                data: status,
            };
        } catch (error) {
            console.error("Error buscando el status de factura:", error);

            return {
                status: 500,
                message: "Error interno al buscar el status de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateStatusInvoiceDto) {
        try {
            const updated = await prisma.statusInvoice.update({
                where: { id },
                data,
                select: statusInvoiceSelect,
            });

            return {
                status: 200,
                message: "Status de factura actualizado éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando el status de factura:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el status de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.statusInvoice.delete({
                where: { id },
                select: statusInvoiceSelect,
            });

            return {
                status: 200,
                message: "Status de factura eliminado éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando el status de factura:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el status de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findByName(name: string) {
        return prisma.statusInvoice.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
            select: statusInvoiceSelect,
        });
    }

    async findAny() {
        return prisma.statusInvoice.findFirst({
            orderBy: { id: "asc" },
            select: statusInvoiceSelect,
        });
    }
}
