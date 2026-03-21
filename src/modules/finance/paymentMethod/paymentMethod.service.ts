import { prisma } from "@/configs";
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from "./paymentMethod.interface";

const paymentMethodSelect = {
    id: true,
    name: true,
    type: true,
    currency: true,
    is_active: true,
} as const;

export class PaymentMethodService {

    async create(data: CreatePaymentMethodDto) {
        try {
            const created = await prisma.paymentMethod.create({
                data,
                select: paymentMethodSelect,
            });

            return {
                status: 201,
                message: "Método de pago creado éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error creando el método de pago:", error);

            return {
                status: 500,
                message: "Error interno al crear el método de pago",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const methods = await prisma.paymentMethod.findMany({
                orderBy: { id: "desc" },
                select: paymentMethodSelect,
            });

            return {
                status: 200,
                message: methods.length === 0 ? "No se encontraron métodos de pago" : "Métodos de pago encontrados éxitosamente",
                data: methods,
            };
        } catch (error) {
            console.error("Error buscando métodos de pago:", error);

            return {
                status: 500,
                message: "Error interno al buscar métodos de pago",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const method = await prisma.paymentMethod.findUnique({
                where: { id },
                select: paymentMethodSelect,
            });

            return {
                status: 200,
                message: "Método de pago encontrado éxitosamente",
                data: method,
            };
        } catch (error) {
            console.error("Error buscando el método de pago:", error);

            return {
                status: 500,
                message: "Error interno al buscar el método de pago",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdatePaymentMethodDto) {
        try {
            const updated = await prisma.paymentMethod.update({
                where: { id },
                data,
                select: paymentMethodSelect,
            });

            return {
                status: 200,
                message: "Método de pago actualizado éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando el método de pago:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el método de pago",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.paymentMethod.delete({
                where: { id },
                select: paymentMethodSelect,
            });

            return {
                status: 200,
                message: "Método de pago eliminado éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando el método de pago:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el método de pago",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
