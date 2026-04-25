import { prisma } from "@/configs";
import { CreatePayrollLineDto, UpdatePayrollLineDto } from "./payrollLine.interface";

const payrollLineSelect = {
    id: true,
    payrollId: true,
    consultationId: true,
    base_amount: true,
    commission_percentage: true,
    payroll: {
        select: {
            id: true,
            period_start: true,
            period_end: true,
            status: true,
            created_at: true,
        },
    },
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

export class PayrollLineService {

    async create(data: CreatePayrollLineDto) {
        try {
            const created = await prisma.payrollLine.create({
                data: {
                    payrollId: Number(data.payrollId),
                    consultationId: Number(data.consultationId),
                    base_amount: data.base_amount as any,
                    commission_percentage: data.commission_percentage as any,
                },
                select: payrollLineSelect,
            });

            return {
                status: 201,
                message: "Línea de nómina creada éxitosamente",
                data: created,
            };
        } catch (error) {
            console.error("Error creando la línea de nómina:", error);

            return {
                status: 500,
                message: "Error interno al crear la línea de nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const lines = await prisma.payrollLine.findMany({
                orderBy: { id: "desc" },
                select: payrollLineSelect,
            });

            return {
                status: 200,
                message: lines.length === 0 ? "No se encontraron líneas de nómina" : "Líneas de nómina encontradas éxitosamente",
                data: lines,
            };
        } catch (error) {
            console.error("Error buscando líneas de nómina:", error);

            return {
                status: 500,
                message: "Error interno al buscar líneas de nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const line = await prisma.payrollLine.findUnique({
                where: { id },
                select: payrollLineSelect,
            });

            return {
                status: 200,
                message: "Línea de nómina encontrada éxitosamente",
                data: line,
            };
        } catch (error) {
            console.error("Error buscando la línea de nómina:", error);

            return {
                status: 500,
                message: "Error interno al buscar la línea de nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdatePayrollLineDto) {
        try {
            const updated = await prisma.payrollLine.update({
                where: { id },
                data: {
                    ...(data.payrollId !== undefined ? { payrollId: Number(data.payrollId) } : {}),
                    ...(data.consultationId !== undefined ? { consultationId: Number(data.consultationId) } : {}),
                    ...(data.base_amount !== undefined ? { base_amount: data.base_amount as any } : {}),
                    ...(data.commission_percentage !== undefined ? { commission_percentage: data.commission_percentage as any } : {}),
                },
                select: payrollLineSelect,
            });

            return {
                status: 200,
                message: "Línea de nómina actualizada éxitosamente",
                data: updated,
            };
        } catch (error) {
            console.error("Error actualizando la línea de nómina:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la línea de nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const deleted = await prisma.payrollLine.delete({
                where: { id },
                select: payrollLineSelect,
            });

            return {
                status: 200,
                message: "Línea de nómina eliminada éxitosamente",
                data: deleted,
            };
        } catch (error) {
            console.error("Error eliminando la línea de nómina:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la línea de nómina",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
