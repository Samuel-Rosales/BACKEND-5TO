import { prisma } from "./shared";
import { seedBase } from "./base.seed";
import { seedClinical } from "./clinical.seed";
import { seedExpenses } from "./expenses.seed";
import { seedFinance } from "./finance.seed";
import { seedInventory } from "./inventory.seed";
import { seedPayroll } from "./payroll.seed";
import { seedProcurement } from "./procurement.seed";

export async function runSeed() {
    try {
        const base = await seedBase();
        const finance = await seedFinance();
        const inventory = await seedInventory();
        const clinical = await seedClinical({
            users: base.users,
            finance: {
                invoiceStatuses: {
                    proforma: finance.invoiceStatuses.proforma,
                    paid: finance.invoiceStatuses.paid,
                },
                taxId: finance.taxId,
                exchangeRates: {
                    active: finance.exchangeRates.active,
                },
                paymentMethods: {
                    cashUsd: finance.paymentMethods.cashUsd,
                    transferBs: finance.paymentMethods.transferBs,
                    zelleUsd: finance.paymentMethods.zelleUsd,
                },
            },
            inventory,
        });
        const procurement = await seedProcurement({
            base,
            finance: {
                exchangeRates: finance.exchangeRates,
                paymentMethods: finance.paymentMethods,
            },
            inventory,
        });
        const expenses = await seedExpenses({
            finance,
            procurement,
        });
        const payroll = await seedPayroll({
            clinical,
        });

        const summary = {
            base,
            finance,
            inventory,
            clinical,
            procurement,
            expenses,
            payroll,
        };

        console.log("Demo seed IDs:", summary);
        console.log("Seed completed");

        return summary;
    } finally {
        await prisma.$disconnect();
    }
}
