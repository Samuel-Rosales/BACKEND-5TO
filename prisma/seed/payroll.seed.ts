import { ensurePayroll, ensurePayrollLine } from "./shared";

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

    return {
        payrolls: [payrollCurrent.id, payrollPrevious.id],
    };
}
