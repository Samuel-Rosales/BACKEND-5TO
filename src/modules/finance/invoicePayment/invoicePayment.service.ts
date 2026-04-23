import { prisma } from "@/configs";
import { CreateInvoicePaymentDto, UpdateInvoicePaymentDto } from "./invoicePayment.interface";
import { resolveExchangeRate } from "@/utils/exchange-rate.util";

const IGTF_RATE = 0.03;

const invoicePaymentSelect = {
    id: true,
    invoiceId: true,
    paymentMethodId: true,
    amount_paid: true,
    igtf_amount: true,
    exchangeRateId: true,
    date_at: true,
    paymentMethod: {
        select: { id: true, name: true, type: true, currency: true, is_active: true },
    },
    exchangeRate: {
        select: { id: true, rate: true, createdAt: true, is_active: true },
    },
    invoice: {
        select: {
            id: true,
            patientId: true,
            receptionistId: true,
            exchangeRateId: true,
            total_usd: true,
            statusId: true,
            taxId: true,
            status: {
                select: { id: true, name: true, color_hex: true },
            },
            exchangeRate: {
                select: { id: true, rate: true, createdAt: true, is_active: true },
            },
            tax: {
                select: { id: true, name: true, rate: true, code: true, isActive: true },
            },
            patient: {
                select: {
                    id: true,
                    user: { select: { id: true, ci: true, name: true } },
                },
            },
            receptionist: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                },
            }
        }
    }
} as const;

function roundMoney(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function shouldApplyIgtf(method: { type: string; currency: string }) {
    const type = (method.type || "").toLowerCase();
    const currency = (method.currency || "").toLowerCase();

    const isCash = type.includes("cash") || type.includes("efectivo");
    const isForeign = currency.includes("usd") || currency.includes("dolar") || currency.includes("dólar") || currency.includes("$");

    return isCash && isForeign;
}

export class InvoicePaymentService {
    async create(data: CreateInvoicePaymentDto) {
        try {
            const method = await prisma.paymentMethod.findUnique({ where: { id: data.paymentMethodId } });
            if (!method) throw new Error("El método de pago no existe");

            const rate = await resolveExchangeRate(data.exchangeRateId);

            const amountPaid = Number(data.amount_paid);
            const igtfAmount = shouldApplyIgtf(method) ? roundMoney(amountPaid * IGTF_RATE) : 0;

            const created = await prisma.invoicePayment.create({
                data: {
                    invoiceId: data.invoiceId,
                    paymentMethodId: data.paymentMethodId,
                    amount_paid: amountPaid,
                    igtf_amount: igtfAmount,
                    exchangeRateId: rate.id,
                },
                select: invoicePaymentSelect,
            });

            return {
                status: 201,
                message: "Pago de factura registrado éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error creando el pago de factura:", error);

            return {
                status: 500,
                message: "Error interno al registrar el pago de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const payments = await prisma.invoicePayment.findMany({
                orderBy: { id: "desc" },
                select: invoicePaymentSelect,
            });

            return {
                status: 200,
                message: payments.length === 0 ? "No se encontraron pagos de factura" : "Pagos de factura encontrados éxitosamente",
                data: payments,
            };
        } catch (error) {
            console.error("Error buscando pagos de factura:", error);

            return {
                status: 500,
                message: "Error interno al buscar pagos de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const payment = await prisma.invoicePayment.findUnique({
                where: { id },
                select: invoicePaymentSelect,
            });

            return {
                status: 200,
                message: "Pago de factura encontrado éxitosamente",
                data: payment,
            };
        } catch (error) {
            console.error("Error buscando el pago de factura:", error);

            return {
                status: 500,
                message: "Error interno al buscar el pago de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateInvoicePaymentDto) {
        try {
            const existing = await prisma.invoicePayment.findUnique({ where: { id } });
            if (!existing) {
                return {
                    status: 404,
                    message: "Pago de factura no encontrado",
                    data: null,
                };
            }

            const methodId = data.paymentMethodId ?? existing.paymentMethodId;
            const method = await prisma.paymentMethod.findUnique({ where: { id: methodId } });
            if (!method) throw new Error("El método de pago no existe");

            const rate = await resolveExchangeRate(data.exchangeRateId ?? existing.exchangeRateId);
            const amountPaid = data.amount_paid !== undefined ? Number(data.amount_paid) : Number(existing.amount_paid);
            const igtfAmount = shouldApplyIgtf(method) ? roundMoney(amountPaid * IGTF_RATE) : 0;

            const updated = await prisma.invoicePayment.update({
                where: { id },
                data: {
                    ...data,
                    amount_paid: data.amount_paid !== undefined ? amountPaid : undefined,
                    igtf_amount: igtfAmount,
                    exchangeRateId: rate.id,
                },
                select: invoicePaymentSelect,
            });

            return {
                status: 200,
                message: "Pago de factura actualizado éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando el pago de factura:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el pago de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.invoicePayment.delete({
                where: { id },
                select: invoicePaymentSelect,
            });

            return {
                status: 200,
                message: "Pago de factura eliminado éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando el pago de factura:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el pago de factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
