import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definido en el entorno");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export function hashPassword(plain: string) {
    const saltRounds = 10;
    return bcrypt.hashSync(plain, saltRounds);
}

export async function ensureRole(name: string, code: string) {
    const normalizedName = name.trim();
    const normalizedCode = code.trim().toUpperCase();

    const existingByCode = await prisma.role.findFirst({
        where: { code: { equals: normalizedCode, mode: "insensitive" } },
        select: { id: true, active: true, name: true, code: true },
    });

    if (existingByCode) {
        if (
            !existingByCode.active ||
            existingByCode.name !== normalizedName ||
            existingByCode.code !== normalizedCode
        ) {
            return prisma.role.update({
                where: { id: existingByCode.id },
                data: { name: normalizedName, code: normalizedCode, active: true },
                select: { id: true },
            });
        }

        return { id: existingByCode.id };
    }

    const existingByName = await prisma.role.findFirst({
        where: { name: { equals: normalizedName, mode: "insensitive" } },
        select: { id: true, active: true, name: true, code: true },
    });

    if (existingByName) {
        if (existingByName.active && existingByName.name === normalizedName && existingByName.code === normalizedCode) {
            return { id: existingByName.id };
        }

        try {
            return await prisma.role.update({
                where: { id: existingByName.id },
                data: { name: normalizedName, code: normalizedCode, active: true },
                select: { id: true },
            });
        } catch {
            return prisma.role.update({
                where: { id: existingByName.id },
                data: { name: normalizedName, active: true },
                select: { id: true },
            });
        }
    }

    return prisma.role.create({
        data: { name: normalizedName, code: normalizedCode, active: true },
        select: { id: true },
    });
}

export async function ensureUser(params: { ci: string; name: string; password: string; roleId: number }) {
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

export async function ensureMedicalSpecialty(params: { name: string; consultation_price: number; commission_percentage: number }) {
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

export async function ensureDoctor(params: { userId: number; specialtyId: number }) {
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

export async function ensurePatient(params: { userId?: number; ci?: string; name?: string }) {
    if (params.ci) {
        const existingByCi = await prisma.patient.findFirst({
            where: { ci: params.ci, active: true },
            select: { id: true },
        });
        if (existingByCi) return existingByCi;
    }

    const existing = await prisma.patient.findFirst({
        where: {
            userId: params.userId ?? null,
            ci: params.ci ?? null,
            name: params.name ?? null,
            active: true,
        },
        select: { id: true },
    });

    if (existing) return existing;

    if (params.ci) {
        const inactiveByCi = await prisma.patient.findFirst({
            where: { ci: params.ci, active: false },
            select: { id: true },
        });
        if (inactiveByCi) {
            return prisma.patient.update({
                where: { id: inactiveByCi.id },
                data: {
                    active: true,
                    userId: params.userId,
                    name: params.name,
                },
                select: { id: true },
            });
        }
    }

    return prisma.patient.create({
        data: {
            userId: params.userId,
            ci: params.ci,
            name: params.name,
            active: true,
        },
        select: { id: true },
    });
}

export async function ensureInfoPatient(params: {
    patientId: number;
    ci: string;
    name: string;
    last_name: string;
    sex: "MALE" | "FEMALE" | string;
    birth_date: Date;
    blood_type?: string;
    nacionality?: string;
    profession?: string;
    main_phone?: string;
    secondary_phone?: string;
    email?: string;
    address?: string;
    city?: string;
    allergies?: string;
    chronic_diseases?: string;
    current_medications?: string;
    previous_surgeries?: string;
}) {
    const existing = await prisma.infoPatient.findUnique({
        where: { patientId: params.patientId },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.infoPatient.create({
        data: {
            patientId: params.patientId,
            ci: params.ci,
            name: params.name,
            last_name: params.last_name,
            sex: params.sex as any,
            birth_date: params.birth_date,
            blood_type: params.blood_type,
            nacionality: params.nacionality,
            profession: params.profession,
            main_phone: params.main_phone,
            secondary_phone: params.secondary_phone,
            email: params.email,
            address: params.address,
            city: params.city,
            allergies: params.allergies,
            chronic_diseases: params.chronic_diseases,
            current_medications: params.current_medications,
            previous_surgeries: params.previous_surgeries,
            active: true,
        },
        select: { id: true },
    });
}

export async function ensureStatusAppointment(name: string, color_hex?: string) {
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

export async function ensureAppointmentType(name: string) {
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

export async function ensureAppointment(params: {
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

export async function ensureCategory(name: string) {
    const existing = await prisma.category.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
    });
    if (existing) return existing;
    return prisma.category.create({ data: { name }, select: { id: true } });
}

export async function ensureMeasurementUnit(params: { name: string; symbol: string }) {
    const existing = await prisma.measurementUnit.findFirst({
        where: { name: { equals: params.name, mode: "insensitive" } },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.measurementUnit.create({
        data: { name: params.name, symbol: params.symbol, active: true },
        select: { id: true },
    });
}

export async function ensureProduct(params: {
    name: string;
    sku?: string;
    cost_price: number;
    categoryId: number;
    unitId: number;
    min_stock?: number;
    is_perishable?: boolean;
}) {
    if (params.sku) {
        const bySku = await prisma.supply.findFirst({ where: { sku: params.sku }, select: { id: true } });
        if (bySku) return bySku;
    }

    const existing = await prisma.supply.findFirst({
        where: { name: { equals: params.name, mode: "insensitive" } },
        select: { id: true },
    });
    if (existing) return existing;

    return prisma.supply.create({
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

export async function ensureSupplier(params: { name: string; contact?: string; phone?: string }) {
    const existing = await prisma.supplier.findFirst({
        where: { name: { equals: params.name, mode: "insensitive" } },
        select: { id: true },
    });
    if (existing) return existing;
    return prisma.supplier.create({ data: params, select: { id: true } });
}

export async function ensureSymptom(name: string) {
    const existing = await prisma.symptoms.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.symptoms.create({
        data: { name },
        select: { id: true },
    });
}

export async function ensureDiagnosis(params: { code: string; description: string; category: string }) {
    const existing = await prisma.diagnosis.findUnique({
        where: { code: params.code },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.diagnosis.create({
        data: {
            code: params.code,
            description: params.description,
            category: params.category,
        },
        select: { id: true },
    });
}

export async function ensureStatusInvoice(name: string, color_hex?: string) {
    const existing = await prisma.statusInvoice.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.statusInvoice.create({
        data: { name, color_hex },
        select: { id: true },
    });
}

export async function ensureTax(params: { name: string; rate: number; code?: string }) {
    const existing = await prisma.tax.findFirst({
        where: params.code
            ? {
                  OR: [
                      { code: { equals: params.code, mode: "insensitive" } },
                      { name: { equals: params.name, mode: "insensitive" } },
                  ],
              }
            : {
                  name: { equals: params.name, mode: "insensitive" },
              },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.tax.create({
        data: {
            name: params.name,
            code: params.code,
            rate: params.rate,
            isActive: true,
        },
        select: { id: true },
    });
}

export async function ensureActiveExchangeRate(rate: number) {
    const existing = await prisma.exchangeRate.findFirst({
        where: { is_active: true },
        select: { id: true, rate: true },
    });

    if (existing) {
        if (Number(existing.rate) !== rate) {
            return prisma.exchangeRate.update({
                where: { id: existing.id },
                data: { rate, is_active: true },
                select: { id: true },
            });
        }

        return { id: existing.id };
    }

    return prisma.exchangeRate.create({
        data: {
            rate,
            is_active: true,
        },
        select: { id: true },
    });
}

export async function ensureHistoricalExchangeRate(rate: number) {
    const existing = await prisma.exchangeRate.findFirst({
        where: { rate, is_active: false },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.exchangeRate.create({
        data: {
            rate,
            is_active: false,
        },
        select: { id: true },
    });
}

export async function ensurePaymentMethod(params: { name: string; type: string; currency: "USD" | "VES"; is_active?: boolean }) {
    const existing = await prisma.paymentMethod.findFirst({
        where: { name: { equals: params.name, mode: "insensitive" } },
        select: { id: true, type: true, currency: true, is_active: true },
    });

    if (existing) {
        if (
            existing.type !== params.type ||
            existing.currency !== params.currency ||
            existing.is_active !== (params.is_active ?? true)
        ) {
            return prisma.paymentMethod.update({
                where: { id: existing.id },
                data: {
                    type: params.type,
                    currency: params.currency,
                    is_active: params.is_active ?? true,
                },
                select: { id: true },
            });
        }

        return { id: existing.id };
    }

    return prisma.paymentMethod.create({
        data: {
            name: params.name,
            type: params.type,
            currency: params.currency,
            is_active: params.is_active ?? true,
        },
        select: { id: true },
    });
}

export async function ensureExpenseCategory(name: string) {
    const existing = await prisma.expenseCategory.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.expenseCategory.create({
        data: { name },
        select: { id: true },
    });
}

export async function ensurePurchasePayment(params: {
    purchaseId: number;
    paymentMethodId: number;
    amount: number;
    currency?: string;
    reference?: string;
    payment_date?: Date;
}) {
    const existing = await prisma.purchasePayment.findFirst({
        where: {
            purchaseId: params.purchaseId,
            paymentMethodId: params.paymentMethodId,
            amount: params.amount,
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.purchasePayment.create({
        data: {
            purchaseId: params.purchaseId,
            paymentMethodId: params.paymentMethodId,
            amount: params.amount,
            currency: params.currency,
            reference: params.reference,
            payment_date: params.payment_date,
        },
        select: { id: true },
    });
}

export async function ensureInvoicePayment(params: {
    invoiceId: number;
    paymentMethodId: number;
    exchangeRateId: number;
    amount_paid: number;
    igtf_amount?: number;
    date_at?: Date;
}) {
    const existing = await prisma.invoicePayment.findFirst({
        where: {
            invoiceId: params.invoiceId,
            paymentMethodId: params.paymentMethodId,
            amount_paid: params.amount_paid,
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.invoicePayment.create({
        data: {
            invoiceId: params.invoiceId,
            paymentMethodId: params.paymentMethodId,
            exchangeRateId: params.exchangeRateId,
            amount_paid: params.amount_paid,
            igtf_amount: params.igtf_amount ?? 0,
            date_at: params.date_at,
        },
        select: { id: true },
    });
}

export async function ensureInvoiceExpense(params: {
    categoryId: number;
    supplierId: number;
    exchangeRateId: number;
    total_amount: number;
    date_at: Date;
}) {
    const existing = await prisma.invoiceExpense.findFirst({
        where: {
            categoryId: params.categoryId,
            supplierId: params.supplierId,
            exchangeRateId: params.exchangeRateId,
            total_amount: params.total_amount,
            date_at: params.date_at,
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.invoiceExpense.create({
        data: {
            categoryId: params.categoryId,
            supplierId: params.supplierId,
            exchangeRateId: params.exchangeRateId,
            total_amount: params.total_amount,
            date_at: params.date_at,
        },
        select: { id: true },
    });
}

export async function ensureExpensePayment(params: {
    invoiceExpenseId: number;
    paymentMethodId: number;
    amount: number;
    exchangeRateId: number;
    date_at?: Date;
}) {
    const existing = await prisma.expensePayment.findFirst({
        where: {
            invoiceExpenseId: params.invoiceExpenseId,
            paymentMethodId: params.paymentMethodId,
            amount: params.amount,
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.expensePayment.create({
        data: {
            invoiceExpenseId: params.invoiceExpenseId,
            paymentMethodId: params.paymentMethodId,
            amount: params.amount,
            exchangeRateId: params.exchangeRateId,
            date_at: params.date_at,
        },
        select: { id: true },
    });
}

export async function ensurePayroll(params: { period_start: Date; period_end: Date; status: string }) {
    const existing = await prisma.payroll.findFirst({
        where: {
            period_start: params.period_start,
            period_end: params.period_end,
        },
        select: { id: true, status: true },
    });

    if (existing) {
        if (existing.status !== params.status) {
            return prisma.payroll.update({
                where: { id: existing.id },
                data: { status: params.status },
                select: { id: true },
            });
        }

        return { id: existing.id };
    }

    return prisma.payroll.create({
        data: {
            period_start: params.period_start,
            period_end: params.period_end,
            status: params.status,
        },
        select: { id: true },
    });
}

export async function ensurePayrollLine(params: {
    payrollId: number;
    consultationId: number;
    base_amount: number;
    commission_percentage: number;
}) {
    const existing = await prisma.payrollLine.findUnique({
        where: { consultationId: params.consultationId },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.payrollLine.create({
        data: {
            payrollId: params.payrollId,
            consultationId: params.consultationId,
            base_amount: params.base_amount,
            commission_percentage: params.commission_percentage,
        },
        select: { id: true },
    });
}

export async function ensureDoctorSchedule(params: {
    doctorId: number;
    period_start: Date;
    period_end?: Date;
}) {
    const existing = await prisma.doctorSchedule.findFirst({
        where: {
            doctorId: params.doctorId,
            period_start: params.period_start,
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.doctorSchedule.create({
        data: {
            doctorId: params.doctorId,
            period_start: params.period_start,
            period_end: params.period_end,
        },
        select: { id: true },
    });
}

export async function ensureDoctorAvailability(params: {
    doctorScheduleId: number;
    day_of_week: number;
    start_time: Date;
    end_time: Date;
    patient_limit: number;
}) {
    const existing = await prisma.doctorAvailability.findFirst({
        where: {
            doctorScheduleId: params.doctorScheduleId,
            day_of_week: params.day_of_week,
            start_time: params.start_time,
        },
        select: { id: true },
    });

    if (existing) return existing;

    return prisma.doctorAvailability.create({
        data: params,
        select: { id: true },
    });
}

export async function ensureSeedPurchase(params: {
    reference: string;
    supplierId: number;
    userId: number;
    exchangeRateId: number;
    status?: "PENDING" | "COMPLETED" | "CANCELLED" | "ANULLED";
    date?: Date;
    items: Array<{ supplyId: number; quantity: number; unit_cost: number; expiration_date?: Date }>;
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
                status: params.status ?? "COMPLETED",
                exchangeRateId: params.exchangeRateId,
                reference: params.reference,
                observation: "SEED: compra demo",
                date: params.date,
                items: {
                    create: params.items.map((item) => ({
                        supply: { connect: { id: item.supplyId } },
                        quantity: item.quantity,
                        unit_cost: item.unit_cost,
                        expiration_date: item.expiration_date,
                    })),
                },
            },
            select: { id: true, userId: true, items: { select: { supplyId: true, quantity: true, unit_cost: true, expiration_date: true } } },
        });

        const reason = `PURCHASE:${purchase.id}`;

        for (const item of purchase.items) {
            const lot = await tx.stockLot.create({
                data: {
                    supplyId: item.supplyId,
                    quantity: item.quantity,
                    expiration_date: item.expiration_date ?? undefined,
                    lot_cost: item.unit_cost,
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
                    reason,
                },
            });
        }

        return { id: purchase.id };
    });
}
