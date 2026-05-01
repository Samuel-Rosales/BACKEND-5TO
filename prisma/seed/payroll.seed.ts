import { ensurePayroll, ensurePayrollLine } from "./shared";

type PayrollSeedDeps = {
    clinical: {
        consultations: Array<{
            id: number;
            invoiceId: number;
            doctorId: number;
            specialtyCommissionPercentage: number;
            invoiceTotalUsd: number;
        }>;
    };
};

export async function seedPayroll(deps: PayrollSeedDeps) {
    const payrollCurrent = await ensurePayroll({
        period_start: new Date("2026-04-01T00:00:00.000Z"),
        period_end: new Date("2026-04-30T23:59:59.000Z"),
        status: "Pending",
    });

    const payrollPrevious = await ensurePayroll({
        period_start: new Date("2026-03-01T00:00:00.000Z"),
        period_end: new Date("2026-03-31T23:59:59.000Z"),
        status: "Paid",
    });

    const [consultation1, consultation2, consultation3] = deps.clinical.consultations;

    await ensurePayrollLine({
        payrollId: payrollCurrent.id,
        consultationId: consultation1.id,
        base_amount: consultation1.invoiceTotalUsd,
        commission_percentage: consultation1.specialtyCommissionPercentage,
    });

    await ensurePayrollLine({
        payrollId: payrollCurrent.id,
        consultationId: consultation2.id,
        base_amount: consultation2.invoiceTotalUsd,
        commission_percentage: consultation2.specialtyCommissionPercentage,
    });

    await ensurePayrollLine({
        payrollId: payrollPrevious.id,
        consultationId: consultation3.id,
        base_amount: consultation3.invoiceTotalUsd,
        commission_percentage: consultation3.specialtyCommissionPercentage,
    });

    return {
        payrolls: [payrollCurrent.id, payrollPrevious.id],
    };
}
