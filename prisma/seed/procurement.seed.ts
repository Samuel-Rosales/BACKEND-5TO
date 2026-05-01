import { ensurePurchasePayment, ensureSeedPurchase, ensureSupplier } from "./shared";

type ProcurementSeedDeps = {
    base: {
        users: {
            admin: number;
            reception: number;
        };
    };
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
    };
    inventory: {
        products: {
            guantes: number;
            jeringa: number;
            paracetamol: number;
            algodon: number;
            alcohol: number;
            ibuprofeno: number;
            amoxicilina: number;
            lapiz: number;
        };
    };
};

export async function seedProcurement(deps: ProcurementSeedDeps) {
    const supplier1 = await ensureSupplier({ name: "Proveedor Demo", contact: "Juan", phone: "0414-0000000" });
    const supplier2 = await ensureSupplier({ name: "Proveedor 2", contact: "María", phone: "0424-0000000" });
    const supplier3 = await ensureSupplier({ name: "Proveedor Clínico", contact: "Carlos", phone: "0412-0000000" });

    const purchase1 = await ensureSeedPurchase({
        reference: "SEED-PUR-001",
        supplierId: supplier1.id,
        userId: deps.base.users.admin,
        exchangeRateId: deps.finance.exchangeRates.active,
        status: "COMPLETED",
        date: new Date("2026-03-18T12:00:00.000Z"),
        items: [
            { supplyId: deps.inventory.products.guantes, quantity: 50, unit_cost: 1.2, expiration_date: new Date("2026-12-31") },
            { supplyId: deps.inventory.products.jeringa, quantity: 100, unit_cost: 0.45, expiration_date: new Date("2028-12-31") },
        ],
    });

    const purchase2 = await ensureSeedPurchase({
        reference: "SEED-PUR-002",
        supplierId: supplier2.id,
        userId: deps.base.users.reception,
        exchangeRateId: deps.finance.exchangeRates.historical,
        status: "COMPLETED",
        date: new Date("2026-03-19T12:00:00.000Z"),
        items: [
            { supplyId: deps.inventory.products.paracetamol, quantity: 500, unit_cost: 0.08, expiration_date: new Date("2027-06-30") },
            { supplyId: deps.inventory.products.alcohol, quantity: 24, unit_cost: 0.95, expiration_date: new Date("2027-12-31") },
        ],
    });

    const purchase3 = await ensureSeedPurchase({
        reference: "SEED-PUR-003",
        supplierId: supplier3.id,
        userId: deps.base.users.admin,
        exchangeRateId: deps.finance.exchangeRates.active,
        status: "COMPLETED",
        date: new Date("2026-03-20T12:00:00.000Z"),
        items: [
            { supplyId: deps.inventory.products.ibuprofeno, quantity: 300, unit_cost: 0.1, expiration_date: new Date("2027-09-30") },
            { supplyId: deps.inventory.products.amoxicilina, quantity: 200, unit_cost: 0.16, expiration_date: new Date("2027-10-31") },
            { supplyId: deps.inventory.products.lapiz, quantity: 100, unit_cost: 0.05 },
        ],
    });

    await ensurePurchasePayment({
        purchaseId: purchase1.id,
        paymentMethodId: deps.finance.paymentMethods.cashUsd,
        amount: 110,
        currency: "USD",
        reference: "SEED-PUR-001-PAY",
        payment_date: new Date("2026-03-18T15:00:00.000Z"),
    });

    await ensurePurchasePayment({
        purchaseId: purchase2.id,
        paymentMethodId: deps.finance.paymentMethods.transferBs,
        amount: 82,
        currency: "VES",
        reference: "SEED-PUR-002-PAY",
        payment_date: new Date("2026-03-19T15:00:00.000Z"),
    });

    await ensurePurchasePayment({
        purchaseId: purchase3.id,
        paymentMethodId: deps.finance.paymentMethods.zelleUsd,
        amount: 70,
        currency: "USD",
        reference: "SEED-PUR-003-PAY",
        payment_date: new Date("2026-03-20T15:00:00.000Z"),
    });

    return {
        suppliers: {
            supplier1: supplier1.id,
            supplier2: supplier2.id,
            supplier3: supplier3.id,
        },
        purchases: [purchase1.id, purchase2.id, purchase3.id],
    };
}
