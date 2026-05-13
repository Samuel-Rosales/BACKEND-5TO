import { prisma } from "@/configs";

const consultationDiagnosisSelect = {
    id: true,
    consultation_id: true,
    diagnosisId: true,
    is_primary: true,
    condition_status: true,
    onset_date: true,
    created_at: true,
    diagnosis: {
        select: {
            id: true,
            code: true,
            description: true,
            category: true,
        },
    },
} as const;

export interface CreateConsultationDiagnosisDto {
    diagnosisId: number;
    is_primary: boolean;
    condition_status?: string;
    onset_date?: string | Date;
}

export interface UpdateConsultationDiagnosisDto {
    diagnosisId?: number;
    is_primary?: boolean;
    condition_status?: string;
    onset_date?: string | Date;
}

export class ConsultationDiagnosisService {
    async list(consultationId: number) {
        try {
            const items = await prisma.consultationDiagnosis.findMany({
                where: { consultation_id: consultationId },
                orderBy: [{ is_primary: "desc" }, { id: "desc" }],
                select: consultationDiagnosisSelect,
            });

            return {
                status: 200,
                message: "Diagnósticos de la consulta encontrados éxitosamente",
                data: items,
            };
        } catch (error) {
            console.error("Error buscando diagnósticos de la consulta:", error);

            return {
                status: 500,
                message: "Error interno al buscar los diagnósticos de la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async create(consultationId: number, data: CreateConsultationDiagnosisDto) {
        try {
            const item = await prisma.consultationDiagnosis.create({
                data: {
                    consultation_id: consultationId,
                    diagnosisId: data.diagnosisId,
                    is_primary: data.is_primary,
                    condition_status: data.condition_status ?? null,
                    onset_date: data.onset_date ? new Date(data.onset_date) : null,
                },
                select: consultationDiagnosisSelect,
            });

            return {
                status: 201,
                message: "Diagnóstico agregado a la consulta éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error creando diagnóstico de la consulta:", error);

            return {
                status: 500,
                message: "Error interno al agregar el diagnóstico a la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(
        consultationId: number,
        consultationDiagnosisId: number,
        data: UpdateConsultationDiagnosisDto
    ) {
        try {
            const item = await prisma.consultationDiagnosis.update({
                where: { id: consultationDiagnosisId },
                data: {
                    consultation_id: consultationId,
                    diagnosisId: data.diagnosisId ?? undefined,
                    is_primary: data.is_primary ?? undefined,
                    condition_status: data.condition_status ?? undefined,
                    onset_date: data.onset_date ? new Date(data.onset_date) : undefined,
                },
                select: consultationDiagnosisSelect,
            });

            return {
                status: 200,
                message: "Diagnóstico de la consulta actualizado éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error actualizando diagnóstico de la consulta:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el diagnóstico de la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(consultationId: number, consultationDiagnosisId: number) {
        try {
            const item = await prisma.consultationDiagnosis.delete({
                where: { id: consultationDiagnosisId },
                select: consultationDiagnosisSelect,
            });

            return {
                status: 200,
                message: "Diagnóstico eliminado de la consulta éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error eliminando diagnóstico de la consulta:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el diagnóstico de la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
