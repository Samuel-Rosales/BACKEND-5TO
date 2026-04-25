import { prisma } from "@/configs";
import { CreatePayrollDto, UpdatePayrollDto } from "./payroll.interface";

const payrollLineSelect = {
    id: true,
    payrollId: true,
    consultationId: true,
    base_amount: true,
    commission_percentage: true,
    consultation: {
        select: {
            id: true,
            invoiceId: true,
            doctorId: true,
            date: true,
            started_at: true,
            finished_at: true,
            doctor: {
                select: {
                    id: true,
                    specialtyId: true,
                    user: { select: { id: true, ci: true, name: true } },
                    specialty: { select: { id: true, name: true, commission_percentage: true, consultation_price: true } },
                },
            },
            invoice: {
                select: {
                    id: true,
                    total_usd: true,
                    date_at: true,
                },
            },
        },
    },
} as const;

const payrollSelect = {
    id: true,
    period_start: true,
    period_end: true,
    status: true,
    created_at: true,
    payrollLines: {
        orderBy: { id: "asc" },
        select: payrollLineSelect,
    },
} as const;

export class PayrollService {

    async create(data: CreatePayrollDto) {
        try {
            const created = await prisma.payroll.create({
                data: {
                    period_start: data.period_start as any,
                    period_end: data.period_end as any,
                    status: data.status ?? "Pending",
                },
                select: payrollSelect,
            });

            return {
                status: 201,
                message: "Nómina creada éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error creando la nómina:", error);

            return {
                status: 500,
                message: "Error interno al crear la nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const payrolls = await prisma.payroll.findMany({
                orderBy: { id: "desc" },
                select: payrollSelect,
            });

            return {
                status: 200,
                message: payrolls.length === 0 ? "No se encontraron nóminas" : "Nóminas encontradas éxitosamente",
                data: payrolls,
            };
        } catch (error) {
            console.error("Error buscando nóminas:", error);

            return {
                status: 500,
                message: "Error interno al buscar nóminas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const payroll = await prisma.payroll.findUnique({
                where: { id },
                select: payrollSelect,
            });

            return {
                status: 200,
                message: "Nómina encontrada éxitosamente",
                data: payroll,
            };
        } catch (error) {
            console.error("Error buscando la nómina:", error);

            return {
                status: 500,
                message: "Error interno al buscar la nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdatePayrollDto) {
        try {
            const updated = await prisma.payroll.update({
                where: { id },
                data: {
                    ...(data.period_start !== undefined ? { period_start: data.period_start as any } : {}),
                    ...(data.period_end !== undefined ? { period_end: data.period_end as any } : {}),
                    ...(data.status !== undefined ? { status: data.status } : {}),
                },
                select: payrollSelect,
            });

            return {
                status: 200,
                message: "Nómina actualizada éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando la nómina:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.$transaction(async (tx) => {
                await tx.payrollLine.deleteMany({ where: { payrollId: id } });
                return tx.payroll.delete({ where: { id }, select: payrollSelect });
            });

            return {
                status: 200,
                message: "Nómina eliminada éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando la nómina:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
