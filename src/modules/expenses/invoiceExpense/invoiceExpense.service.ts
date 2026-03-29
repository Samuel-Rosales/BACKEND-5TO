import { prisma } from "@/configs";
import { CreateInvoiceExpenseDto, UpdateInvoiceExpenseDto } from "./invoiceExpense.interface";
import { Decimal } from "@prisma/client/runtime/client";

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

    private async resolveExchangeRateId(exchangeRateId?: number) {
        if (exchangeRateId) {
            const rate = await prisma.exchangeRate.findUnique({ where: { id: exchangeRateId } });
            if (!rate) throw new Error("La tasa de cambio no existe");
            return rate;
        }

        const active = await prisma.exchangeRate.findFirst({ where: { is_active: true }, orderBy: { createdAt: "desc" } });
        if (!active) throw new Error("No existe una tasa de cambio activa");
        return active;
    }

    async create(data: CreateInvoiceExpenseDto) {
        try {
            const rate = await this.resolveExchangeRateId(data.exchangeRateId);

            if (!Array.isArray(data.payments) || data.payments.length === 0) {
                return {
                    status: 400,
                    message: "Debe proporcionar al menos un pago en payments",
                    error: "Validación",
                };
            }

            const paymentMethodIds = [...new Set(data.payments.map((p) => p.paymentMethodId))];

            if (paymentMethodIds.length === 0) {
                return {
                    status: 400,
                    message: "Debe proporcionar al menos un método de pago",
                    error: "Validación",
                };
            }

            const methodPayments = await prisma.paymentMethod.findMany({
                where: { id: { in: paymentMethodIds } },
                select: {
                    id: true,
                    currency: true,
                },
            });

            if (methodPayments.length !== paymentMethodIds.length) {
                return {
                    status: 400,
                    message: "No se encontraron métodos de pago válidos para todos los pagos",
                    error: "Validación",
                };
            }

            let totalPaidBase = new Decimal(0);
            const totalAmountBase = new Decimal(data.total_amount);
            
            for ( const pay of data.payments ) {
                const method = methodPayments.find(m => m.id === pay.paymentMethodId);

                if (!method) {
                    throw new Error(`El método de pago con ID ${pay.paymentMethodId} no existe`);
                }

                const amount = new Decimal(pay.amount);

                if (amount.lte(new Decimal(0))) {
                    return {
                        status: 400,
                        message: "El monto de cada pago debe ser mayor a 0",
                        error: "Validación",
                    };
                }

                if (method.currency !== "USD") {
                    if (rate.rate.lte(new Decimal(0))) {
                        return {
                            status: 400,
                            message: "La tasa de cambio debe ser mayor a 0 para convertir a USD",
                            error: "Validación",
                        };
                    }

                    totalPaidBase = totalPaidBase.plus(amount.div(rate.rate));
                } else {
                    totalPaidBase = totalPaidBase.plus(amount);
                }
            }

            if (totalPaidBase.sub(totalAmountBase).abs().gt(new Decimal(0.01))) {
                return {
                    message: `Error en montos del gasto. Calculado: ${totalPaidBase.toFixed(2)}, Enviado: ${totalAmountBase.toFixed(2)}`,
                    status: 400,
                    data: null,
                    error: "Validación",
                };
            }

            const result = await prisma.$transaction(async (tx) => {

                const invoice = await tx.invoiceExpense.create({
                    data: {
                        categoryId: data.categoryId,
                        supplierId: data.supplierId,
                        total_amount: totalAmountBase,
                        exchangeRateId: rate.id,
                        date_at: data.date_at ? new Date(data.date_at) : undefined,
                    },
                    select: invoiceExpenseSelect,
                });

                for (const payment of data.payments) {
                    await tx.expensePayment.create({
                        data: {
                            invoiceExpenseId: invoice.id,
                            paymentMethodId: payment.paymentMethodId,
                            amount: new Decimal(payment.amount),
                            exchangeRateId: rate.id,
                            date_at: payment.date_at ? new Date(payment.date_at) : undefined,
                        }
                    });
                }

                return invoice;
            });

            if (!result) {
                throw new Error("Error creando el gasto");
            }

            return {
                status: 201,
                message: "Gasto creado éxitosamente",
                data: result,
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
