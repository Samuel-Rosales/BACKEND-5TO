import { prisma } from "@/configs";
import { CreateExpensePaymentDto, UpdateExpensePaymentDto } from "./expensePayment.interface";

const exchangeRateSelect = {
    id: true,
    rate: true,
    createdAt: true,
    is_active: true,
} as const;

const paymentMethodSelect = {
    id: true,
    name: true,
    type: true,
    currency: true,
} as const;

const expensePaymentSelect = {
    id: true,
    invoiceExpenseId: true,
    paymentMethodId: true,
    amount: true,
    exchangeRateId: true,
    date_at: true,
    paymentMethod: {
        select: paymentMethodSelect,
    },
    exchangeRate: {
        select: exchangeRateSelect,
    },
    invoiceExpense: {
        select: {
            id: true,
            categoryId: true,
            supplierId: true,
            exchangeRateId: true,
            total_amount: true,
            date_at: true,
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            supplier: {
                select: {
                    id: true,
                    name: true,
                    contact: true,
                    phone: true,
                },
            },
        },
    },
} as const;

export class ExpensePaymentService {

    async create(data: CreateExpensePaymentDto) {
        try {
            const payment = await prisma.expensePayment.create({
                data,
                select: expensePaymentSelect,
            });

            if (!payment) {
                throw new Error("Error creando el pago de gasto");
            }

            return {
                status: 201,
                message: "Pago de gasto creado éxitosamente",
                data: payment,
            };
        } catch (error) {
            console.error("Error creando el pago de gasto:", error);

            return {
                status: 500,
                message: "Error interno al crear el pago de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const payments = await prisma.expensePayment.findMany({
                orderBy: { date_at: "desc" },
                select: expensePaymentSelect,
            });

            if (!payments) {
                throw new Error("Error buscando pagos de gasto");
            }

            if (payments.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron pagos de gasto",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Pagos de gasto encontrados éxitosamente",
                data: payments,
            };
        } catch (error) {
            console.error("Error buscando pagos de gasto:", error);

            return {
                status: 500,
                message: "Error interno al buscar los pagos de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const payment = await prisma.expensePayment.findUnique({
                where: { id },
                select: expensePaymentSelect,
            });

            if (!payment) {
                throw new Error("Error buscando el pago de gasto");
            }

            return {
                status: 200,
                message: "Pago de gasto encontrado éxitosamente",
                data: payment,
            };
        } catch (error) {
            console.error("Error buscando el pago de gasto:", error);

            return {
                status: 500,
                message: "Error interno al buscar el pago de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateExpensePaymentDto) {
        try {
            const payment = await prisma.expensePayment.update({
                where: { id },
                data,
                select: expensePaymentSelect,
            });

            if (!payment) {
                throw new Error("Error actualizando el pago de gasto");
            }

            return {
                status: 200,
                message: "Pago de gasto actualizado éxitosamente",
                data: payment,
            };
        } catch (error) {
            console.error("Error actualizando el pago de gasto:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el pago de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const payment = await prisma.expensePayment.delete({
                where: { id },
                select: expensePaymentSelect,
            });

            if (!payment) {
                throw new Error("Error eliminando el pago de gasto");
            }

            return {
                status: 200,
                message: "Pago de gasto eliminado éxitosamente",
                data: payment,
            };
        } catch (error) {
            console.error("Error eliminando el pago de gasto:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el pago de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
