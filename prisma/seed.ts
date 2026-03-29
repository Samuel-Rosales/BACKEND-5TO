import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definido en el entorno");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(plain: string) {
    const saltRounds = 10;
    return bcrypt.hashSync(plain, saltRounds);
}

async function ensureRole(name: string, code: string) {
    const existing = await prisma.role.findFirst({
        where: {
            OR: [
                { name: { equals: name, mode: "insensitive" } },
                { code: { equals: code, mode: "insensitive" } },
            ],
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.role.create({
        data: { name, code, active: true },
        select: { id: true },
    });
}

async function ensureUser(params: { ci: string; name: string; password: string; roleId: number }) {
    const existing = await prisma.user.findUnique({ where: { ci: params.ci }, select: { id: true } });
    if (existing) return existing;

    return prisma.user.create({
        data: {
            ci: params.ci,
            name: params.name,
            password: hashPassword(params.password),
            roleId: params.roleId,
            active: true,
        },
        select: { id: true },
    });
}

async function ensureMedicalSpecialty(params: { name: string; consultation_price: number; commission_percentage: number }) {
    const existing = await prisma.medicalSpecialty.findFirst({
        where: { name: { equals: params.name, mode: "insensitive" } },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.medicalSpecialty.create({
        data: {
            name: params.name,
            consultation_price: params.consultation_price,
            commission_percentage: params.commission_percentage,
            active: true,
        },
        select: { id: true },
    });
}

async function ensureDoctor(params: { userId: number; specialtyId: number }) {
    const existing = await prisma.doctor.findUnique({ where: { userId: params.userId }, select: { id: true } });
    if (existing) return existing;

    return prisma.doctor.create({
        data: {
            userId: params.userId,
            specialtyId: params.specialtyId,
            active: true,
        },
        select: { id: true },
    });
}

async function ensurePatient(params: { userId?: number; tipo_sangre?: string; medical_history?: string }) {
    if (params.userId) {
        const existing = await prisma.patient.findUnique({ where: { userId: params.userId }, select: { id: true, active: true } });
        if (existing && existing.active) return { id: existing.id };
        if (existing && !existing.active) {
            const revived = await prisma.patient.update({
                where: { userId: params.userId },
                data: { active: true },
                select: { id: true },
            });
            return revived;
        }
    }

    const existing = await prisma.patient.findFirst({
        where: {
            userId: params.userId ?? null,
            tipo_sangre: params.tipo_sangre ?? null,
            medical_history: params.medical_history ?? null,
            active: true,
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.patient.create({
        data: {
            userId: params.userId,
            tipo_sangre: params.tipo_sangre,
            medical_history: params.medical_history,
            active: true,
        },
        select: { id: true },
    });
}

async function ensureStatusAppointment(name: string, color_hex?: string) {
    const existing = await prisma.statusAppointment.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
    });
    if (existing) return existing;
    return prisma.statusAppointment.create({
        data: { name, color_hex },
        select: { id: true },
    });
}

async function ensureAppointmentType(name: string) {
    const existing = await prisma.appointmentType.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
    });
    if (existing) return existing;
    return prisma.appointmentType.create({
        data: { name },
        select: { id: true },
    });
}

async function ensureAppointment(params: {
    doctorId: number;
    patientId: number;
    statusId: number;
    typeId: number;
    price: number;
    date_time: Date;
    reson_visit?: string;
}) {
    const existing = await prisma.appointment.findFirst({
        where: {
            doctorId: params.doctorId,
            patientId: params.patientId,
            date_time: params.date_time,
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.appointment.create({
        data: {
            doctorId: params.doctorId,
            patientId: params.patientId,
            statusId: params.statusId,
            typeId: params.typeId,
            price: params.price,
            date_time: params.date_time,
            reson_visit: params.reson_visit,
        },
        select: { id: true },
    });
}

async function ensureCategory(name: string) {
    const existing = await prisma.category.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
    });
    if (existing) return existing;
    return prisma.category.create({ data: { name }, select: { id: true } });
}

async function ensureMeasurementUnit(params: { name: string; symbol: string }) {
    const existing = await prisma.measurementUnit.findFirst({
        where: {
            name: { equals: params.name, mode: "insensitive" },
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.measurementUnit.create({
        data: { name: params.name, symbol: params.symbol, active: true },
        select: { id: true },
    });
}

async function ensureProduct(params: {
    name: string;
    sku?: string;
    cost_price: number;
    categoryId: number;
    unitId: number;
    min_stock?: number;
    is_perishable?: boolean;
}) {
    if (params.sku) {
        const bySku = await prisma.product.findFirst({ where: { sku: params.sku }, select: { id: true } });
        if (bySku) return bySku;
    }

    const existing = await prisma.product.findFirst({
        where: { name: { equals: params.name, mode: "insensitive" } },
        select: { id: true },
    });
    if (existing) return existing;

    return prisma.product.create({
        data: {
            name: params.name,
            sku: params.sku,
            cost_price: params.cost_price,
            categoryId: params.categoryId,
            unitId: params.unitId,
            min_stock: params.min_stock ?? 0,
            is_perishable: params.is_perishable ?? false,
            active: true,
        },
        select: { id: true },
    });
}

async function ensureSupplier(params: { name: string; contact?: string; phone?: string }) {
    const existing = await prisma.supplier.findFirst({
        where: { name: { equals: params.name, mode: "insensitive" } },
        select: { id: true },
    });
    if (existing) return existing;
    return prisma.supplier.create({ data: params, select: { id: true } });
}

async function ensureSeedPurchase(params: {
    reference: string;
    supplierId: number;
    userId: number;
    exchangeRateId: number;
    items: Array<{ productId: number; quantity: number; unit_cost: number; expiration_date?: Date }>;
}) {
    const existing = await prisma.purchase.findFirst({
        where: { reference: params.reference },
        select: { id: true },
    });
    if (existing) return existing;

    return prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.create({
            data: {
                supplierId: params.supplierId,
                userId: params.userId,
                status: "COMPLETED",
                exchangeRateId: params.exchangeRateId,
                reference: params.reference,
                observation: "SEED: compra demo",
                items: {
                    create: params.items.map((i) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        unit_cost: i.unit_cost,
                        expiration_date: i.expiration_date,
                    })),
                },
            },
            select: { id: true, userId: true, items: { select: { productId: true, quantity: true, unit_cost: true, expiration_date: true } } },
        });

        const reason = `PURCHASE:${purchase.id}`;

        for (const item of purchase.items) {
            const lot = await tx.stockLot.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    expiration_date: item.expiration_date ?? undefined,
                    lot_cost: item.unit_cost,
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
                    reason,
                },
            });
        }

        return { id: purchase.id };
    });
}

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
            rate: 500,
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

async function ensureDemoData() {
    // Roles
    const roleAdmin = await ensureRole("Admin", "ADMIN");
    const roleDoctor = await ensureRole("Doctor", "DOCTOR");
    const roleReception = await ensureRole("Recepcionista", "RECEPTION");
    const rolePatient = await ensureRole("Paciente", "PATIENT");

    // Usuarios
    const adminUser = await ensureUser({ ci: "V-90000001", name: "Admin Demo", password: "123456", roleId: roleAdmin.id });
    const doctorUser1 = await ensureUser({ ci: "V-10000001", name: "Dr Demo 1", password: "123456", roleId: roleDoctor.id });
    const doctorUser2 = await ensureUser({ ci: "V-10000002", name: "Dr Demo 2", password: "123456", roleId: roleDoctor.id });
    const receptionUser = await ensureUser({ ci: "V-80000001", name: "Recepción Demo", password: "123456", roleId: roleReception.id });
    const patientUser = await ensureUser({ ci: "V-70000001", name: "Paciente Demo", password: "123456", roleId: rolePatient.id });

    // Especialidades
    const specMG = await ensureMedicalSpecialty({ name: "Medicina General", consultation_price: 20, commission_percentage: 30 });
    const specPedi = await ensureMedicalSpecialty({ name: "Pediatría", consultation_price: 25, commission_percentage: 30 });
    const specCardio = await ensureMedicalSpecialty({ name: "Cardiología", consultation_price: 50, commission_percentage: 25 });

    // Doctores
    const doctor1 = await ensureDoctor({ userId: doctorUser1.id, specialtyId: specMG.id });
    const doctor2 = await ensureDoctor({ userId: doctorUser2.id, specialtyId: specPedi.id });

    // Pacientes
    const patient1 = await ensurePatient({ userId: patientUser.id, tipo_sangre: "O+", medical_history: "SEED: sin alergias conocidas" });
    const patient2 = await ensurePatient({ tipo_sangre: "A+", medical_history: "SEED: asma leve" });
    const patient3 = await ensurePatient({ tipo_sangre: "B-", medical_history: "SEED: hipertensión" });

    const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
    const extraPatients: Array<{ id: number }> = [];
    for (let i = 1; i <= 12; i++) {
        const p = await ensurePatient({
            tipo_sangre: bloodTypes[i % bloodTypes.length],
            medical_history: `SEED: paciente extra #${i}`,
        });
        extraPatients.push(p);
    }

    // Scheduling
    const stPend = await ensureStatusAppointment("Pendiente", "#facc15");
    const stConf = await ensureStatusAppointment("Confirmada", "#22c55e");
    const stCanc = await ensureStatusAppointment("Cancelada", "#ef4444");
    const stFin = await ensureStatusAppointment("Finalizada", "#3b82f6");
    void stPend; void stConf; void stCanc; void stFin;

    const typeConsulta = await ensureAppointmentType("Consulta");
    const typeControl = await ensureAppointmentType("Control");
    void typeConsulta; void typeControl;

    // Inventario
    const catInsumos = await ensureCategory("Insumos");
    const catMedic = await ensureCategory("Medicamentos");
    const unitUnidad = await ensureMeasurementUnit({ name: "Unidad", symbol: "u" });

    const prodGuantes = await ensureProduct({ name: "Guantes", sku: "INS-GUANTES", cost_price: 1.25, categoryId: catInsumos.id, unitId: unitUnidad.id });
    const prodJeringa = await ensureProduct({ name: "Jeringa", sku: "INS-JERINGA", cost_price: 0.5, categoryId: catInsumos.id, unitId: unitUnidad.id });
    const prodParacetamol = await ensureProduct({ name: "Paracetamol 500mg", sku: "MED-PARAC-500", cost_price: 0.1, categoryId: catMedic.id, unitId: unitUnidad.id });

    // Productos extra (para poblar vistas/listados)
    const extraProducts = [
        { name: "Algodón", sku: "INS-ALGODON", cost_price: 0.2, categoryId: catInsumos.id, unitId: unitUnidad.id },
        { name: "Alcohol 70%", sku: "INS-ALCOHOL-70", cost_price: 1.0, categoryId: catInsumos.id, unitId: unitUnidad.id },
        { name: "Ibuprofeno 400mg", sku: "MED-IBU-400", cost_price: 0.12, categoryId: catMedic.id, unitId: unitUnidad.id },
        { name: "Amoxicilina 500mg", sku: "MED-AMOX-500", cost_price: 0.18, categoryId: catMedic.id, unitId: unitUnidad.id },
    ];
    for (const p of extraProducts) {
        await ensureProduct({ ...p, min_stock: 0, is_perishable: false });
    }

    // Appointments demo (útiles para calendar/UI)
    const baseDate = new Date("2026-03-22T08:00:00.000Z");
    const apPatients = [patient1, patient2, patient3, ...extraPatients.slice(0, 3)];
    for (let i = 0; i < apPatients.length; i++) {
        const start1 = new Date(baseDate.getTime() + i * 60 * 60 * 1000);
        await ensureAppointment({
            doctorId: doctor1.id,
            patientId: apPatients[i].id,
            statusId: i % 2 === 0 ? stPend.id : stConf.id,
            typeId: typeConsulta.id,
            price: 20,
            date_time: start1,
            reson_visit: "SEED: cita demo",
        });
    }

    for (let i = 0; i < apPatients.length; i++) {
        const start2 = new Date(baseDate.getTime() + (i + 1) * 60 * 60 * 1000);
        await ensureAppointment({
            doctorId: doctor2.id,
            patientId: apPatients[i].id,
            statusId: i % 2 === 0 ? stConf.id : stPend.id,
            typeId: typeControl.id,
            price: 25,
            date_time: start2,
            reson_visit: "SEED: control",
        });
    }

    const activeRate = await prisma.exchangeRate.findFirst({
        where: { is_active: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, rate: true },
    });
    if (!activeRate) throw new Error("No existe ExchangeRate activa (seed finance debió crear una)");

    // 1 consulta demo sin finalizar (modelo nuevo: Consultation -> invoiceId)
    const existingConsult = await prisma.consultation.findFirst({
        where: {
            doctorId: doctor1.id,
            finished_at: null,
        },
        select: { id: true, invoiceId: true },
    });

    let consultationId: number;
    if (existingConsult) {
        consultationId = existingConsult.id;
    } else {
        const statusProforma = await prisma.statusInvoice.findFirst({
            where: { name: { equals: "Proforma", mode: "insensitive" } },
            select: { id: true },
        });
        if (!statusProforma) throw new Error('No existe StatusInvoice "Proforma"');

        const defaultTax = await prisma.tax.findFirst({
            where: {
                OR: [
                    { code: { equals: "IVA", mode: "insensitive" } },
                    { name: { equals: "IVA", mode: "insensitive" } },
                ],
            },
            select: { id: true },
        });
        if (!defaultTax) throw new Error('No existe Tax "IVA"');

        const totalUsd = new Prisma.Decimal(20);
        const totalBs = totalUsd.mul(activeRate.rate);

        const invoice = await prisma.invoice.create({
            data: {
                patientId: patient1.id,
                receptionistId: receptionUser.id,
                exchangeRateId: activeRate.id,
                statusId: statusProforma.id,
                taxId: defaultTax.id,
                total_usd: totalUsd,
            },
            select: { id: true },
        });

        const consultation = await prisma.consultation.create({
            data: {
                doctorId: doctor1.id,
                invoiceId: invoice.id,
            },
            select: { id: true },
        });

        consultationId = consultation.id;
    }

    // Insumo consumido en consulta
    const existingSupply = await prisma.supplyConsultation.findFirst({
        where: { consultationId: consultationId, productId: prodGuantes.id },
        select: { id: true },
    });
    if (!existingSupply) {
        await prisma.supplyConsultation.create({
            data: { consultationId: consultationId, productId: prodGuantes.id, quantity: 2 },
            select: { id: true },
        });
    }

    // Procurement
    const supplier1 = await ensureSupplier({ name: "Proveedor Demo", contact: "Juan", phone: "0414-0000000" });
    const supplier2 = await ensureSupplier({ name: "Proveedor 2", contact: "María", phone: "0424-0000000" });

    // Compras demo para poblar stock lots/movements
    await ensureSeedPurchase({
        reference: "SEED-PUR-001",
        supplierId: supplier1.id,
        userId: adminUser.id,
        exchangeRateId: activeRate.id,
        items: [
            { productId: prodGuantes.id, quantity: 50, unit_cost: 1.2, expiration_date: new Date("2026-12-31") },
            { productId: prodJeringa.id, quantity: 100, unit_cost: 0.45, expiration_date: new Date("2028-12-31") },
        ],
    });

    await ensureSeedPurchase({
        reference: "SEED-PUR-002",
        supplierId: supplier2.id,
        userId: receptionUser.id,
        exchangeRateId: activeRate.id,
        items: [
            { productId: prodParacetamol.id, quantity: 500, unit_cost: 0.08, expiration_date: new Date("2027-06-30") },
        ],
    });

    return {
        roles: { admin: roleAdmin.id, doctor: roleDoctor.id, reception: roleReception.id, patient: rolePatient.id },
        users: { admin: adminUser.id, doctor1: doctorUser1.id, doctor2: doctorUser2.id, reception: receptionUser.id },
        doctors: { doctor1: doctor1.id, doctor2: doctor2.id },
        patients: { patient1: patient1.id, patient2: patient2.id, patient3: patient3.id },
        consultationId,
        suppliers: { supplier1: supplier1.id, supplier2: supplier2.id },
        products: { guantes: prodGuantes.id, jeringa: prodJeringa.id, paracetamol: prodParacetamol.id },
        specialties: { mg: specMG.id, pedi: specPedi.id, cardio: specCardio.id },
        exchangeRateId: activeRate.id,
    };
}

async function main() {
    await ensureStatusInvoiceProforma();
    await ensureDefaultTax();
    await ensureActiveExchangeRate();
    await ensurePaymentMethods();

    const demo = await ensureDemoData();
    console.log("Demo seed IDs:", demo);
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
