import { prisma } from "@/configs";

const symptomsConsultaSelect = {
    id: true,
    symptoms_id: true,
    consultation_id: true,
    severity: true,
    duration: true,
    notes: true,
    created_at: true,
    symptom: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

export interface CreateSymptomsConsultaDto {
    symptomId: number;
    severity: string;
    duration: string;
    notes?: string;
}

export interface UpdateSymptomsConsultaDto {
    symptomId?: number;
    severity?: string;
    duration?: string;
    notes?: string;
}

export class SymptomsConsultaService {
    async list(consultationId: number) {
        try {
            const items = await prisma.symptomsConsultation.findMany({
                where: { consultation_id: consultationId },
                orderBy: { id: "desc" },
                select: symptomsConsultaSelect,
            });

            return {
                status: 200,
                message: "Síntomas de la consulta encontrados éxitosamente",
                data: items,
            };
        } catch (error) {
            console.error("Error buscando síntomas de la consulta:", error);

            return {
                status: 500,
                message: "Error interno al buscar los síntomas de la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async create(consultationId: number, data: CreateSymptomsConsultaDto) {
        try {
            const item = await prisma.symptomsConsultation.create({
                data: {
                    consultation_id: consultationId,
                    symptoms_id: data.symptomId,
                    severity: data.severity,
                    duration: data.duration,
                    notes: data.notes ?? null,
                },
                select: symptomsConsultaSelect,
            });

            return {
                status: 201,
                message: "Síntoma agregado a la consulta éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error creando síntoma de la consulta:", error);

            return {
                status: 500,
                message: "Error interno al agregar el síntoma a la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(consultationId: number, symptomsConsultaId: number, data: UpdateSymptomsConsultaDto) {
        try {
            const item = await prisma.symptomsConsultation.update({
                where: { id: symptomsConsultaId },
                data: {
                    consultation_id: consultationId,
                    symptoms_id: data.symptomId ?? undefined,
                    severity: data.severity ?? undefined,
                    duration: data.duration ?? undefined,
                    notes: data.notes ?? undefined,
                },
                select: symptomsConsultaSelect,
            });

            return {
                status: 200,
                message: "Síntoma de la consulta actualizado éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error actualizando síntoma de la consulta:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el síntoma de la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(consultationId: number, symptomsConsultaId: number) {
        try {
            const item = await prisma.symptomsConsultation.delete({
                where: { id: symptomsConsultaId },
                select: symptomsConsultaSelect,
            });

            return {
                status: 200,
                message: "Síntoma eliminado de la consulta éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error eliminando síntoma de la consulta:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el síntoma de la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
