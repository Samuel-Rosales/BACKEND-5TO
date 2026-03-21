import { prisma } from "@/configs";
import { CreatePurchasePaymentDto, UpdatePurchasePaymentDto } from "./purchasePayment.interface";

const paymentMethodSelect = {
    id: true,
    name: true,
    type: true,
    currency: true,
    is_active: true,
} as const;

const purchasePaymentSelect = {
    id: true,
    purchaseId: true,
    paymentMethodId: true,
    amount: true,
    currency: true,
    reference: true,
    payment_date: true,
    paymentMethod: {
        select: paymentMethodSelect,
    },
    purchase: {
        select: {
            id: true,
            supplierId: true,
            userId: true,
            status: true,
            exchangeRateId: true,
            reference: true,
            date: true,
            discount: true,
        },
    },
} as const;

export class PurchasePaymentService {

    async create(data: CreatePurchasePaymentDto) {
        try {
            const created = await prisma.purchasePayment.create({
                data: {
                    purchaseId: data.purchaseId,
                    paymentMethodId: data.paymentMethodId,
                    amount: data.amount as any,
                    currency: data.currency,
                    reference: data.reference,
                    payment_date: data.payment_date as any,
                },
                select: purchasePaymentSelect,
            });

            return {
                status: 201,
                message: "Pago de compra registrado éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error registrando pago de compra:", error);

            return {
                status: 500,
                message: "Error interno al registrar el pago de compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const payments = await prisma.purchasePayment.findMany({
                orderBy: { id: "desc" },
                select: purchasePaymentSelect,
            });

            return {
                status: 200,
                message: payments.length === 0 ? "No se encontraron pagos de compra" : "Pagos de compra encontrados éxitosamente",
                data: payments,
            };
        } catch (error) {
            console.error("Error buscando pagos de compra:", error);

            return {
                status: 500,
                message: "Error interno al buscar pagos de compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const payment = await prisma.purchasePayment.findUnique({
                where: { id },
                select: purchasePaymentSelect,
            });

            return {
                status: 200,
                message: "Pago de compra encontrado éxitosamente",
                data: payment,
            };
        } catch (error) {
            console.error("Error buscando el pago de compra:", error);

            return {
                status: 500,
                message: "Error interno al buscar el pago de compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdatePurchasePaymentDto) {
        try {
            const updated = await prisma.purchasePayment.update({
                where: { id },
                data: {
                    ...data,
                    amount: data.amount !== undefined ? (data.amount as any) : undefined,
                    payment_date: data.payment_date as any,
                },
                select: purchasePaymentSelect,
            });

            return {
                status: 200,
                message: "Pago de compra actualizado éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando el pago de compra:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el pago de compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.purchasePayment.delete({
                where: { id },
                select: purchasePaymentSelect,
            });

            return {
                status: 200,
                message: "Pago de compra eliminado éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando el pago de compra:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el pago de compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
