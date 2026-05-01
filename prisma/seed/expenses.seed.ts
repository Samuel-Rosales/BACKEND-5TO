import { ensureExpensePayment, ensureInvoiceExpense, ensureSupplier } from "./shared";

type ExpensesSeedDeps = {
    finance: {
        exchangeRates: {
            active: number;
            historical: number;
        };
        paymentMethods: {
            cashUsd: number;
            transferBs: number;
            zelleUsd: number;
            mobilePayment: number;
        };
        expenseCategories: {
            utilities: number;
            software: number;
            maintenance: number;
        };
    };
    procurement: {
        suppliers: {
            supplier1: number;
            supplier2: number;
            supplier3: number;
        };
    };
};

export async function seedExpenses(deps: ExpensesSeedDeps) {
    const supplier1 = await ensureSupplier({ name: "Proveedor Demo", contact: "Juan", phone: "0414-0000000" });
    const supplier2 = await ensureSupplier({ name: "Proveedor 2", contact: "María", phone: "0424-0000000" });
    const supplier3 = await ensureSupplier({ name: "Proveedor Clínico", contact: "Carlos", phone: "0412-0000000" });
    void deps.procurement.suppliers;

    const expense1 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.utilities,
        supplierId: supplier1.id,
        exchangeRateId: deps.finance.exchangeRates.active,
        total_amount: 85,
        date_at: new Date("2026-03-21T12:00:00.000Z"),
    });

    const expense2 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.software,
        supplierId: supplier2.id,
        exchangeRateId: deps.finance.exchangeRates.historical,
        total_amount: 140,
        date_at: new Date("2026-03-22T12:00:00.000Z"),
    });

    const expense3 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.maintenance,
        supplierId: supplier3.id,
        exchangeRateId: deps.finance.exchangeRates.active,
        total_amount: 60,
        date_at: new Date("2026-03-23T12:00:00.000Z"),
    });

    await ensureExpensePayment({
        invoiceExpenseId: expense1.id,
        paymentMethodId: deps.finance.paymentMethods.cashUsd,
        amount: 85,
        exchangeRateId: deps.finance.exchangeRates.active,
        date_at: new Date("2026-03-21T16:00:00.000Z"),
    });

    await ensureExpensePayment({
        invoiceExpenseId: expense2.id,
        paymentMethodId: deps.finance.paymentMethods.mobilePayment,
        amount: 140,
        exchangeRateId: deps.finance.exchangeRates.historical,
        date_at: new Date("2026-03-22T16:00:00.000Z"),
    });

    await ensureExpensePayment({
        invoiceExpenseId: expense3.id,
        paymentMethodId: deps.finance.paymentMethods.zelleUsd,
        amount: 60,
        exchangeRateId: deps.finance.exchangeRates.active,
        date_at: new Date("2026-03-23T16:00:00.000Z"),
    });

    return {
        expenses: [expense1.id, expense2.id, expense3.id],
    };
}
