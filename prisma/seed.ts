import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definido en el entorno");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function ensureStatusInvoiceProforma() {
    const existing = await prisma.statusInvoice.findFirst({
        where: { name: { equals: "Proforma", mode: "insensitive" } },
        select: { id: true },
    });

    if (existing) return;

    await prisma.statusInvoice.create({
        data: {
            name: "Proforma",
            color_hex: "#999999",
        },
    });
}

async function ensureDefaultTax() {
    const existing = await prisma.tax.findFirst({
        where: {
            OR: [
                { code: { equals: "IVA", mode: "insensitive" } },
                { name: { equals: "IVA", mode: "insensitive" } },
            ],
        },
        select: { id: true },
    });

    if (existing) return;

    await prisma.tax.create({
        data: {
            name: "IVA",
            code: "IVA",
            rate: 16,
            isActive: true,
        },
    });
}

async function ensureActiveExchangeRate() {
    const existing = await prisma.exchangeRate.findFirst({
        where: { is_active: true },
        select: { id: true },
    });

    if (existing) return;

    await prisma.exchangeRate.create({
        data: {
            rate: 1,
            is_active: true,
        },
    });
}

async function ensurePaymentMethods() {
    const defaults = [
        { name: "Efectivo USD", type: "Efectivo", currency: "USD", is_active: true },
        { name: "Transferencia Bs", type: "Transferencia", currency: "VES", is_active: true },
    ] as const;

    for (const item of defaults) {
        const existing = await prisma.paymentMethod.findFirst({
            where: { name: { equals: item.name, mode: "insensitive" } },
            select: { id: true },
        });

        if (!existing) {
            await prisma.paymentMethod.create({ data: item });
        }
    }
}

async function main() {
    await ensureStatusInvoiceProforma();
    await ensureDefaultTax();
    await ensureActiveExchangeRate();
    await ensurePaymentMethods();
}

main()
    .then(() => {
        console.log("Seed completed");
    })
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
