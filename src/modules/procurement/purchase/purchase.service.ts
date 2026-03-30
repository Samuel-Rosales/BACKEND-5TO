import { prisma } from "@/configs";
import { CreatePurchaseDto, UpdatePurchaseDto } from "./purchase.interface";
import { Decimal } from "@prisma/client/runtime/client";
import { StatusPurchase } from "@prisma/client";
import { resolveExchangeRate } from "@/utils/exchange-rate.util";

const purchaseStockReason = (purchaseId: number) => `PURCHASE:${purchaseId}`;
// Backward-compat: some movements were created with this key.
const legacyPurchaseStockReason = (purchaseId: number) => `COMPRA:${purchaseId}`;

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
    is_active: true,
} as const;

const purchaseSelect = {
    id: true,
    supplierId: true,
    userId: true,
    status: true,
    exchangeRateId: true,
    reference: true,
    observation: true,
    date: true,
    discount: true,
    supplier: {
        select: {
            id: true,
            name: true,
            contact: true,
            phone: true,
        },
    },
    user: {
        select: {
            id: true,
            ci: true,
            name: true,
            roleId: true,
            active: true,
        },
    },
    exchangeRate: {
        select: exchangeRateSelect,
    },
    items: {
        orderBy: { id: "asc" },
        select: {
            id: true,
            purchaseId: true,
            supplyId: true,
            quantity: true,
            unit_cost: true,
            expiration_date: true,
            supply: {
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    active: true,
                    cost_price: true,
                },
            },
        },
    },
    payments: {
        orderBy: { id: "desc" },
        select: {
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
        },
    },
} as const;

export class PurchaseService {
    async create(data: CreatePurchaseDto) {
        try {
            const rate = await resolveExchangeRate(data.exchangeRateId);

            if (!Array.isArray(data.items) || data.items.length === 0) {
                return {
                    status: 400,
                    message: "Debe proporcionar al menos un item en items",
                    error: "Validación",
                };
            }

            const supplier = await prisma.supplier.findUnique({
                where: { id: data.supplierId },
                select: { id: true },
            });

            if (!supplier) {
                return {
                    status: 400,
                    message: "El proveedor no existe",
                    error: "Validación",
                };
            }

            const supplyIds = [...new Set(data.items.map((i) => i.supplyId))];
            const supplies = await prisma.supply.findMany({
                where: { id: { in: supplyIds }, active: true },
                select: { id: true },
            });

            if (supplies.length !== supplyIds.length) {
                return {
                    status: 400,
                    message: "Hay suministros inválidos o inactivos en items",
                    error: "Validación",
                };
            }

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

            let totalAmountItems = new Decimal(0);

            for (const item of data.items) {
                if (item.quantity <= 0) {
                    return {    
                        status: 400,
                        message: "La cantidad de cada item debe ser mayor a 0",
                        error: "Validación",
                    };
                }
                let unitCost: Decimal;
                try {
                    unitCost = new Decimal(item.unit_cost as any);
                } catch {
                    return {
                        status: 400,
                        message: "El costo unitario de cada item debe ser un número válido",
                        error: "Validación",
                    };
                }

                if (unitCost.lte(new Decimal(0))) {
                    return {
                        status: 400,
                        message: "El costo unitario de cada item debe ser mayor a 0",
                        error: "Validación",
                    };
                }

                if (item.expiration_date) {
                    const exp = new Date(item.expiration_date);
                    if (Number.isNaN(exp.getTime())) {
                        return {
                            status: 400,
                            message: "La fecha de vencimiento de cada item debe ser una fecha válida",
                            error: "Validación",
                        };
                    }
                }

                totalAmountItems = totalAmountItems.plus(unitCost.times(item.quantity));
            }

            let totalPaidBase = new Decimal(0);

            const totalAmountBase = totalAmountItems;
            
            const methodById = new Map(methodPayments.map((m) => [m.id, m] as const));

            for ( const pay of data.payments ) {
                const method = methodById.get(pay.paymentMethodId);

                if (!method) {
                    throw new Error(`El método de pago con ID ${pay.paymentMethodId} no existe`);
                }

                let amount: Decimal;
                try {
                    amount = new Decimal(pay.amount as any);
                } catch {
                    return {
                        status: 400,
                        message: "El monto de cada pago debe ser un número válido",
                        error: "Validación",
                    };
                }

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
                    message: `Error en montos de la compra. Pagos (USD): ${totalPaidBase.toFixed(2)}, Items (USD): ${totalAmountBase.toFixed(2)}`,
                    status: 400,
                    data: null,
                    error: "Validación",
                };
            }

            const reason = purchaseStockReason;

            const created = await prisma.$transaction(async (tx) => {

                const purchase = await tx.purchase.create({
                    data: {
                        supplierId: data.supplierId,
                        userId: data.userId,
                        exchangeRateId: rate.id,
                        status: StatusPurchase.COMPLETED,
                        reference: data.reference,
                        observation: data.observation,
                        items: {
                            create: data.items.map((i) => ({
                                supply: { connect: { id: i.supplyId } },
                                quantity: i.quantity,
                                unit_cost: i.unit_cost as any,
                                expiration_date: i.expiration_date ? new Date(i.expiration_date) : undefined,
                            })),
                        },
                        payments: {
                            create: data.payments.map((p) => {
                                const method = methodById.get(p.paymentMethodId);
                                if (!method) {
                                    // Should be impossible due to previous validations.
                                    throw new Error(`El método de pago con ID ${p.paymentMethodId} no existe`);
                                }

                                return {
                                    paymentMethod: { connect: { id: p.paymentMethodId } },
                                    amount: p.amount as any,
                                    currency: method.currency,
                                    payment_date: new Date(),
                                };
                            }),
                        },
                    },
                    select: purchaseSelect,
                });

                for (const item of purchase.items) {
                    const lot = await tx.stockLot.create({
                        data: {
                            supplyId: item.supplyId,
                            quantity: item.quantity,
                            expiration_date: item.expiration_date ?? undefined,
                            lot_cost: item.unit_cost as any,
                        },
                        select: { id: true },
                    });

                    await tx.stockMovement.create({
                        data: {
                            supplyId: item.supplyId,
                            stockLotId: lot.id,
                            userId: purchase.userId,
                            type: "IN",
                            quantity: item.quantity,
                            reason: reason(purchase.id),
                        },
                    });
                }

                return purchase;
            });

            return {
                status: 201,
                message: "Compra creada éxitosamente y stock actualizado por lotes",
                data: created,
            };
        } catch (error) {
            console.error("Error creando la compra:", error);

            return {
                status: 500,
                message: "Error interno al crear la compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {

            
            const purchases = await prisma.purchase.findMany({
                orderBy: { date: "desc" },
                select: purchaseSelect,
            });

            return {
                status: 200,
                message: purchases.length === 0 ? "No se encontraron compras" : "Compras encontradas éxitosamente",
                data: purchases,
            };
        } catch (error) {
            console.error("Error buscando compras:", error);

            return {
                status: 500,
                message: "Error interno al buscar compras",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const purchase = await prisma.purchase.findUnique({
                where: { id },
                select: purchaseSelect,
            });

            return {
                status: 200,
                message: "Compra encontrada éxitosamente",
                data: purchase,
            };
        } catch (error) {
            console.error("Error buscando la compra:", error);

            return {
                status: 500,
                message: "Error interno al buscar la compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdatePurchaseDto) {
        try {
            const purchase = await prisma.purchase.update({
                where: { id },
                data,
                select: purchaseSelect,
            });

            return {
                status: 200,
                message: "Compra actualizada éxitosamente",
                data: purchase,
            };
        } catch (error) {
            console.error("Error actualizando la compra:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const reasons = [purchaseStockReason(id), legacyPurchaseStockReason(id)];
            const movements = await prisma.stockMovement.findMany({
                where: { reason: { in: reasons } },
                select: { stockLotId: true },
            });

            const lotIds = Array.from(new Set(movements.map((m) => m.stockLotId)));

            if (lotIds.length > 0) {
                const otherMovement = await prisma.stockMovement.findFirst({
                    where: {
                        stockLotId: { in: lotIds },
                        NOT: { reason: { in: reasons } },
                    },
                    select: { id: true },
                });

                if (otherMovement) {
                    return {
                        status: 400,
                        message: "No se puede eliminar la compra: los lotes ya tienen otros movimientos de stock",
                        data: null,
                    };
                }
            }

            const deleted = await prisma.$transaction(async (tx) => {
                await tx.purchasePayment.deleteMany({ where: { purchaseId: id } });
                await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });

                if (lotIds.length > 0) {
                    await tx.stockMovement.deleteMany({ where: { reason: { in: reasons } } });
                    await tx.stockLot.deleteMany({ where: { id: { in: lotIds } } });
                }

                return tx.purchase.delete({
                    where: { id },
                    select: purchaseSelect,
                });
            });

            return {
                status: 200,
                message: "Compra eliminada éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando la compra:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la compra",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
