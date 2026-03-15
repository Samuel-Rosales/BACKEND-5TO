import { prisma } from "@/configs";
import { CreateInvoiceExpenseDto, UpdateInvoiceExpenseDto } from "./invoiceExpense.interface";

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

const invoiceExpenseSelect = {
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
    exchangeRate: {
        select: exchangeRateSelect,
    },
    payments: {
        orderBy: { date_at: "desc" },
        select: {
            id: true,
            invoiceExpenseId: true,
            paymentMethodId: true,
            amount: true,
            igtf_amount: true,
            exchangeRateId: true,
            date_at: true,
            paymentMethod: {
                select: paymentMethodSelect,
            },
            exchangeRate: {
                select: exchangeRateSelect,
            },
        },
    },
} as const;

export class InvoiceExpenseService {

    async create(data: CreateInvoiceExpenseDto) {
        try {
            const invoice = await prisma.invoiceExpense.create({
                data,
                select: invoiceExpenseSelect,
            });

            if (!invoice) {
                throw new Error("Error creando el gasto");
            }

            return {
                status: 201,
                message: "Gasto creado éxitosamente",
                data: invoice,
            };
        } catch (error) {
            console.error("Error creando el gasto:", error);

            return {
                status: 500,
                message: "Error interno al crear el gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const invoices = await prisma.invoiceExpense.findMany({
                orderBy: { date_at: "desc" },
                select: invoiceExpenseSelect,
            });

            if (!invoices) {
                throw new Error("Error buscando gastos");
            }

            if (invoices.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron gastos",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Gastos encontrados éxitosamente",
                data: invoices,
            };
        } catch (error) {
            console.error("Error buscando gastos:", error);

            return {
                status: 500,
                message: "Error interno al buscar los gastos",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const invoice = await prisma.invoiceExpense.findUnique({
                where: { id },
                select: invoiceExpenseSelect,
            });

            if (!invoice) {
                throw new Error("Error buscando el gasto");
            }

            return {
                status: 200,
                message: "Gasto encontrado éxitosamente",
                data: invoice,
            };
        } catch (error) {
            console.error("Error buscando el gasto:", error);

            return {
                status: 500,
                message: "Error interno al buscar el gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateInvoiceExpenseDto) {
        try {
            const invoice = await prisma.invoiceExpense.update({
                where: { id },
                data,
                select: invoiceExpenseSelect,
            });

            if (!invoice) {
                throw new Error("Error actualizando el gasto");
            }

            return {
                status: 200,
                message: "Gasto actualizado éxitosamente",
                data: invoice,
            };
        } catch (error) {
            console.error("Error actualizando el gasto:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const invoice = await prisma.invoiceExpense.delete({
                where: { id },
                select: invoiceExpenseSelect,
            });

            if (!invoice) {
                throw new Error("Error eliminando el gasto");
            }

            return {
                status: 200,
                message: "Gasto eliminado éxitosamente",
                data: invoice,
            };
        } catch (error) {
            console.error("Error eliminando el gasto:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
