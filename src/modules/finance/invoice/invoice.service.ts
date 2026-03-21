import { prisma } from "@/configs";
import { CreateInvoiceDto, CreateInvoiceDetailDto, UpdateInvoiceDto } from "./invoice.interface";

const invoiceSelect = {
    id: true,
    consultationId: true,
    exchangeRateId: true,
    total_usd: true,
    total_bs: true,
    statusId: true,
    status: {
        select: { id: true, name: true, color_hex: true },
    },
    exchangeRate: {
        select: { id: true, rate: true, createdAt: true, is_active: true },
    },
    consultation: {
        select: {
            id: true,
            appointmentId: true,
            date: true,
            started_at: true,
            finished_at: true,
            patient: {
                select: {
                    id: true,
                    user: { select: { id: true, ci: true, name: true } },
                },
            },
            doctor: {
                select: {
                    id: true,
                    user: { select: { id: true, ci: true, name: true } },
                    specialty: {
                        select: {
                            id: true,
                            name: true,
                            consultation_price: true,
                            commission_percentage: true,
                        },
                    },
                },
            },
            supplies: {
                select: {
                    id: true,
                    quantity: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            cost_price: true,
                        },
                    },
                },
            },
        },
    },
    details: {
        select: {
            id: true,
            productId: true,
            description: true,
            quantity: true,
            unit_price: true,
            taxId: true,
            is_commissionable: true,
            product: {
                select: { id: true, name: true, sku: true },
            },
            tax: {
                select: { id: true, name: true, rate: true, code: true },
            },
        },
    },
    payments: {
        select: {
            id: true,
            paymentMethodId: true,
            currencyId: true,
            amount_paid: true,
            igtf_amount: true,
            exchangeRateId: true,
            paymentMethod: {
                select: { id: true, name: true, type: true, currency: true, is_active: true },
            },
            exchangeRate: {
                select: { id: true, rate: true, createdAt: true, is_active: true },
            },
        },
    },
} as const;

function roundMoney(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function computeTotals(details: Array<{ quantity: number; unit_price: any }>) {
    const totalUsd = details.reduce((acc, d) => acc + Number(d.quantity) * Number(d.unit_price), 0);
    return roundMoney(totalUsd);
}

function computeCommissions(details: Array<{ quantity: number; unit_price: any; is_commissionable: boolean }>, clinicPercent: number) {
    const commissionableTotal = details
        .filter((d) => d.is_commissionable)
        .reduce((acc, d) => acc + Number(d.quantity) * Number(d.unit_price), 0);

    const clinicAmount = (commissionableTotal * clinicPercent) / 100;
    const doctorAmount = commissionableTotal - clinicAmount;

    return {
        clinic_percent: clinicPercent,
        doctor_percent: 100 - clinicPercent,
        base_commissionable_usd: roundMoney(commissionableTotal),
        clinic_amount_usd: roundMoney(clinicAmount),
        doctor_amount_usd: roundMoney(doctorAmount),
    };
}

export class InvoiceService {

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

    private async resolveStatusId(statusId?: number) {
        if (statusId) {
            const status = await prisma.statusInvoice.findUnique({ where: { id: statusId } });
            if (!status) throw new Error("El status de la factura no existe");
            return status;
        }

        const proforma = await prisma.statusInvoice.findFirst({ where: { name: { equals: "Proforma", mode: "insensitive" } } });
        if (proforma) return proforma;

        const any = await prisma.statusInvoice.findFirst({ orderBy: { id: "asc" } });
        if (!any) throw new Error("No existe ningún status de factura (cree uno primero)");
        return any;
    }

    private async resolveDefaultTaxId() {
        const tax = await prisma.tax.findFirst({ where: { isActive: true }, orderBy: { id: "asc" } });
        if (!tax) throw new Error("No existe ningún impuesto activo (cree al menos uno)");
        return tax.id;
    }

    private async autoGenerateDetails(consultationId: number): Promise<CreateInvoiceDetailDto[]> {
        const consultation = await prisma.consultation.findUnique({
            where: { id: consultationId },
            select: {
                id: true,
                doctor: {
                    select: {
                        specialty: {
                            select: {
                                name: true,
                                consultation_price: true,
                            },
                        },
                    },
                },
                supplies: {
                    select: {
                        quantity: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                cost_price: true,
                            },
                        },
                    },
                },
            },
        });

        if (!consultation) throw new Error("La consulta no existe");

        const taxId = await this.resolveDefaultTaxId();

        const details: CreateInvoiceDetailDto[] = [];

        details.push({
            description: `Consulta - ${consultation.doctor.specialty.name}`,
            quantity: 1,
            unit_price: Number(consultation.doctor.specialty.consultation_price),
            taxId,
            is_commissionable: true,
        });

        for (const supply of consultation.supplies) {
            const supplyQty = Number(supply.quantity);
            const unitPrice = Number(supply.product.cost_price) * supplyQty;

            details.push({
                productId: supply.product.id,
                description: `Insumo - ${supply.product.name} (x${supplyQty})`,
                quantity: 1,
                unit_price: unitPrice,
                taxId,
                is_commissionable: false,
            });
        }

        return details;
    }

    async create(data: CreateInvoiceDto) {
        try {
            const exchangeRate = await this.resolveExchangeRateId(data.exchangeRateId);
            const status = await this.resolveStatusId(data.statusId);

            const details = data.details && data.details.length > 0
                ? data.details
                : await this.autoGenerateDetails(data.consultationId);

            const totalUsd = computeTotals(details);
            const totalBs = roundMoney(totalUsd * Number(exchangeRate.rate));

            const created = await prisma.invoice.create({
                data: {
                    consultationId: data.consultationId,
                    exchangeRateId: exchangeRate.id,
                    statusId: status.id,
                    total_usd: totalUsd,
                    total_bs: totalBs,
                    details: {
                        create: details.map((d) => ({
                            productId: d.productId,
                            description: d.description,
                            quantity: d.quantity,
                            unit_price: d.unit_price,
                            taxId: d.taxId,
                            is_commissionable: d.is_commissionable ?? false,
                        })),
                    },
                },
                select: invoiceSelect,
            });

            const clinicPercent = Number(created.consultation.doctor.specialty.commission_percentage);
            const commissions = computeCommissions(
                created.details.map((d) => ({
                    quantity: d.quantity,
                    unit_price: d.unit_price,
                    is_commissionable: d.is_commissionable,
                })),
                clinicPercent,
            );

            return {
                status: 201,
                message: "Factura creada éxitosamente",
                data: { ...created, commissions },
            };
        } catch (error) {
            console.error("Error creando la factura:", error);

            return {
                status: 500,
                message: "Error interno al crear la factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const invoices = await prisma.invoice.findMany({
                orderBy: { id: "desc" },
                select: invoiceSelect,
            });

            return {
                status: 200,
                message: invoices.length === 0 ? "No se encontraron facturas" : "Facturas encontradas éxitosamente",
                data: invoices,
            };
        } catch (error) {
            console.error("Error buscando facturas:", error);

            return {
                status: 500,
                message: "Error interno al buscar facturas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const invoice = await prisma.invoice.findUnique({
                where: { id },
                select: invoiceSelect,
            });

            if (!invoice) {
                return {
                    status: 404,
                    message: "Factura no encontrada",
                    data: null,
                };
            }

            const clinicPercent = Number(invoice.consultation.doctor.specialty.commission_percentage);
            const commissions = computeCommissions(
                invoice.details.map((d) => ({
                    quantity: d.quantity,
                    unit_price: d.unit_price,
                    is_commissionable: d.is_commissionable,
                })),
                clinicPercent,
            );

            return {
                status: 200,
                message: "Factura encontrada éxitosamente",
                data: { ...invoice, commissions },
            };
        } catch (error) {
            console.error("Error buscando la factura:", error);

            return {
                status: 500,
                message: "Error interno al buscar la factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateInvoiceDto) {
        try {
            const existing = await prisma.invoice.findUnique({ where: { id }, select: { total_usd: true } });
            if (!existing) {
                return {
                    status: 404,
                    message: "Factura no encontrada",
                    data: null,
                };
            }

            let newTotalBs: number | undefined;
            if (data.exchangeRateId) {
                const rate = await prisma.exchangeRate.findUnique({ where: { id: data.exchangeRateId } });
                if (!rate) throw new Error("La tasa de cambio no existe");
                newTotalBs = roundMoney(Number(existing.total_usd) * Number(rate.rate));
            }

            const updated = await prisma.invoice.update({
                where: { id },
                data: {
                    ...data,
                    total_bs: newTotalBs,
                },
                select: invoiceSelect,
            });

            const clinicPercent = Number(updated.consultation.doctor.specialty.commission_percentage);
            const commissions = computeCommissions(
                updated.details.map((d) => ({
                    quantity: d.quantity,
                    unit_price: d.unit_price,
                    is_commissionable: d.is_commissionable,
                })),
                clinicPercent,
            );

            return {
                status: 200,
                message: "Factura actualizada éxitosamente",
                data: { ...updated, commissions },
            };
        } catch (error) {
            console.error("Error actualizando la factura:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.$transaction(async (tx) => {
                await tx.invoicePayment.deleteMany({ where: { invoiceId: id } });
                await tx.invoiceDetail.deleteMany({ where: { invoiceId: id } });

                return tx.invoice.delete({
                    where: { id },
                    select: invoiceSelect,
                });
            });

            return {
                status: 200,
                message: "Factura eliminada éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando la factura:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la factura",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
