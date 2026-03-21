import { prisma } from "@/configs";
import { CreatePurchaseDto, UpdatePurchaseDto } from "./purchase.interface";

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
            productId: true,
            quantity: true,
            unit_cost: true,
            expiration_date: true,
            product: {
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
            const reason = (purchaseId: number) => `PURCHASE:${purchaseId}`;

            const created = await prisma.$transaction(async (tx) => {
                const purchase = await tx.purchase.create({
                    data: {
                        supplierId: data.supplierId,
                        userId: data.userId,
                        exchangeRateId: data.exchangeRateId,
                        status: data.status,
                        reference: data.reference,
                        observation: data.observation,
                        discount: data.discount as any,
                        items: {
                            create: data.items.map((i) => ({
                                productId: i.productId,
                                quantity: i.quantity,
                                unit_cost: i.unit_cost as any,
                                expiration_date: i.expiration_date as any,
                            })),
                        },
                    },
                    select: purchaseSelect,
                });

                for (const item of purchase.items) {
                    const lot = await tx.stockLot.create({
                        data: {
                            productId: item.productId,
                            quantity: item.quantity,
                            expiration_date: item.expiration_date ?? undefined,
                            lot_cost: item.unit_cost as any,
                        },
                        select: { id: true },
                    });

                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
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
                data: {
                    ...data,
                    discount: data.discount as any,
                },
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
            const reason = `PURCHASE:${id}`;
            const movements = await prisma.stockMovement.findMany({
                where: { reason },
                select: { stockLotId: true },
            });

            const lotIds = Array.from(new Set(movements.map((m) => m.stockLotId)));

            if (lotIds.length > 0) {
                const otherMovement = await prisma.stockMovement.findFirst({
                    where: {
                        stockLotId: { in: lotIds },
                        NOT: { reason },
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
                    await tx.stockMovement.deleteMany({ where: { reason } });
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
