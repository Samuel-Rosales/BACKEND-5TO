import { ensurePayroll, ensurePayrollLine, ensurePayrollPayment, ensureSalaryPayment, prisma } from "./shared";

type PayrollSeedDeps = {
    clinical: {
        consultations: Array<{
            id: number;
            invoiceId: number;
            doctorId: number;
            specialtyCommissionPercentage: number;
            invoiceTotalUsd: number;
            startedAt?: Date;
            date?: Date;
        }>;
    };
};

export async function seedPayroll(deps: PayrollSeedDeps) {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0, 0);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    const payrollCurrent = await ensurePayroll({
        period_start: currentMonthStart,
        period_end: currentMonthEnd,
        status: "Pending",
    });

    const payrollPrevious = await ensurePayroll({
        period_start: previousMonthStart,
        period_end: previousMonthEnd,
        status: "Paid",
    });

    for (const consultation of deps.clinical.consultations) {
        const consultationDate = new Date(consultation.startedAt ?? consultation.date ?? today);
        const targetPayroll = consultationDate >= currentMonthStart && consultationDate <= currentMonthEnd ? payrollCurrent : payrollPrevious;

        await ensurePayrollLine({
            payrollId: targetPayroll.id,
            consultationId: consultation.id,
            base_amount: consultation.invoiceTotalUsd,
            commission_percentage: consultation.specialtyCommissionPercentage,
        });
    }

    const paidLines = await prisma.payrollLine.findMany({
        where: { payrollId: payrollPrevious.id },
        select: { id: true },
    });

    const payrollUsers = await prisma.consultation.findMany({
        where: { id: { in: deps.clinical.consultations.map((item) => item.id) } },
        select: { doctor: { select: { userId: true } } },
    });

    const uniqueUserIds = Array.from(new Set(payrollUsers.map((item) => item.doctor.userId)));

    const salaryPayments = [] as Array<{ id: number; userId: number }>;
    for (const userId of uniqueUserIds) {
        const salaryPayment = await ensureSalaryPayment({
            payrollId: payrollPrevious.id,
            userId,
            amount: 500,
            concept: "SEED: pago mensual demo",
            date_at: new Date(previousMonthEnd.getTime() - 3 * 24 * 60 * 60 * 1000),
        });
        salaryPayments.push({ id: salaryPayment.id, userId });
    }

    for (const salaryPayment of salaryPayments) {
        for (const line of paidLines.slice(0, 2)) {
            await ensurePayrollPayment({
                salaryPaymentId: salaryPayment.id,
                payrollLineId: line.id,
                amount: 150,
            });
        }
    }

    return {
        payrolls: [payrollCurrent.id, payrollPrevious.id],
    };
}
