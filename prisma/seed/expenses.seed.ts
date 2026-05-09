import { ensureExpensePayment, ensureInvoiceExpense } from "./shared";

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
            rent: number;
            professional: number;
            office: number;
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
    const { supplier1, supplier2, supplier3 } = deps.procurement.suppliers;

    const expense1 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.utilities,
        supplierId: supplier1,
        exchangeRateId: deps.finance.exchangeRates.active,
        total_amount: 85,
        date_at: new Date("2026-03-21T12:00:00.000Z"),
    });

    const expense2 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.software,
        supplierId: supplier2,
        exchangeRateId: deps.finance.exchangeRates.historical,
        total_amount: 140,
        date_at: new Date("2026-03-22T12:00:00.000Z"),
    });

    const expense3 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.maintenance,
        supplierId: supplier3,
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

    const expense4 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.rent,
        supplierId: supplier1,
        exchangeRateId: deps.finance.exchangeRates.active,
        total_amount: 500,
        date_at: new Date("2026-04-01T12:00:00.000Z"),
    });

    const expense5 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.professional,
        supplierId: supplier2,
        exchangeRateId: deps.finance.exchangeRates.active,
        total_amount: 250,
        date_at: new Date("2026-04-03T12:00:00.000Z"),
    });

    const expense6 = await ensureInvoiceExpense({
        categoryId: deps.finance.expenseCategories.office,
        supplierId: supplier3,
        exchangeRateId: deps.finance.exchangeRates.historical,
        total_amount: 45,
        date_at: new Date("2026-04-05T12:00:00.000Z"),
    });

    await ensureExpensePayment({
        invoiceExpenseId: expense4.id,
        paymentMethodId: deps.finance.paymentMethods.transferBs,
        amount: 300,
        exchangeRateId: deps.finance.exchangeRates.active,
        date_at: new Date("2026-04-02T16:00:00.000Z"),
    });

    return {
        expenses: [expense1.id, expense2.id, expense3.id, expense4.id, expense5.id, expense6.id],
    };
}
