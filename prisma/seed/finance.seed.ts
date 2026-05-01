import {
    ensureActiveExchangeRate,
    ensureExpenseCategory,
    ensureHistoricalExchangeRate,
    ensurePaymentMethod,
    ensureStatusInvoice,
    ensureTax,
} from "./shared";

export async function seedFinance() {
    const proformaStatus = await ensureStatusInvoice("Proforma", "#999999");
    const paidStatus = await ensureStatusInvoice("Pagada", "#22c55e");
    const cancelledStatus = await ensureStatusInvoice("Anulada", "#ef4444");

    const ivaTax = await ensureTax({ name: "IVA", rate: 16, code: "IVA" });

    const activeExchangeRate = await ensureActiveExchangeRate(500);
    const historicalExchangeRate = await ensureHistoricalExchangeRate(475);

    const cashUsd = await ensurePaymentMethod({ name: "Efectivo USD", type: "Cash", currency: "USD", is_active: true });
    const transferBs = await ensurePaymentMethod({ name: "Transferencia Bs", type: "Transferencia", currency: "VES", is_active: true });
    const zelleUsd = await ensurePaymentMethod({ name: "Zelle USD", type: "Transferencia", currency: "USD", is_active: true });
    const mobilePayment = await ensurePaymentMethod({ name: "Pago móvil VES", type: "Pago móvil", currency: "VES", is_active: true });

    const utilityCategory = await ensureExpenseCategory("Servicios públicos");
    const softwareCategory = await ensureExpenseCategory("Software y suscripciones");
    const maintenanceCategory = await ensureExpenseCategory("Mantenimiento");

    return {
        invoiceStatuses: {
            proforma: proformaStatus.id,
            paid: paidStatus.id,
            cancelled: cancelledStatus.id,
        },
        taxId: ivaTax.id,
        exchangeRates: {
            active: activeExchangeRate.id,
            historical: historicalExchangeRate.id,
        },
        paymentMethods: {
            cashUsd: cashUsd.id,
            transferBs: transferBs.id,
            zelleUsd: zelleUsd.id,
            mobilePayment: mobilePayment.id,
        },
        expenseCategories: {
            utilities: utilityCategory.id,
            software: softwareCategory.id,
            maintenance: maintenanceCategory.id,
        },
    };
}
