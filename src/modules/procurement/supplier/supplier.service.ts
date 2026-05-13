import { prisma } from "@/configs";
import { CreateSupplierDto, UpdateSupplierDto } from "./supplier.interface";

const supplierSelect = {
    id: true,
    name: true,
    contact: true,
    phone: true,
} as const;

export class SupplierService {

    async create(data: CreateSupplierDto) {
        try {
            const supplier = await prisma.supplier.create({
                data,
                select: supplierSelect,
            });

            return {
                status: 201,
                message: "Proveedor creado éxitosamente",
                data: supplier,
            };
        } catch (error) {
            console.error("Error creando el proveedor:", error);

            return {
                status: 500,
                message: "Error interno al crear el proveedor",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const suppliers = await prisma.supplier.findMany({
                orderBy: { id: "desc" },
                select: supplierSelect,
            });

            return {
                status: 200,
                message: suppliers.length === 0 ? "No se encontraron proveedores" : "Proveedores encontrados éxitosamente",
                data: suppliers,
            };
        } catch (error) {
            console.error("Error buscando proveedores:", error);

            return {
                status: 500,
                message: "Error interno al buscar proveedores",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const supplier = await prisma.supplier.findUnique({
                where: { id },
                select: supplierSelect,
            });

            return {
                status: 200,
                message: "Proveedor encontrado éxitosamente",
                data: supplier,
            };
        } catch (error) {
            console.error("Error buscando el proveedor:", error);

            return {
                status: 500,
                message: "Error interno al buscar el proveedor",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateSupplierDto) {
        try {
            const supplier = await prisma.supplier.update({
                where: { id },
                data,
                select: supplierSelect,
            });

            return {
                status: 200,
                message: "Proveedor actualizado éxitosamente",
                data: supplier,
            };
        } catch (error) {
            console.error("Error actualizando el proveedor:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el proveedor",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const supplier = await prisma.supplier.delete({
                where: { id },
                select: supplierSelect,
            });

            return {
                status: 200,
                message: "Proveedor eliminado éxitosamente",
                data: supplier,
            };
        } catch (error) {
            console.error("Error eliminando el proveedor:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el proveedor",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
