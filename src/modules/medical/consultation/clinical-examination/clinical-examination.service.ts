import { prisma } from "@/configs";

const clinicalExaminationSelect = {
    id: true,
    consultation_id: true,
    weight: true,
    height: true,
    temperature: true,
    systolic_bp: true,
    diastolic_bp: true,
    heart_rate: true,
    respiratory_rate: true,
    oxygen_saturation: true,
    created_at: true,
} as const;

export interface CreateClinicalExaminationDto {
    weight?: string | number;
    height?: string | number;
    temperature?: string | number;
    systolic_bp?: number;
    diastolic_bp?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    oxygen_saturation?: string | number;
}

export interface UpdateClinicalExaminationDto extends CreateClinicalExaminationDto {}

export class ClinicalExaminationService {
    async list(consultationId: number) {
        try {
            const items = await prisma.clinicalExamination.findMany({
                where: { consultation_id: consultationId },
                orderBy: { id: "desc" },
                select: clinicalExaminationSelect,
            });

            return {
                status: 200,
                message: "Exámenes clínicos encontrados éxitosamente",
                data: items,
            };
        } catch (error) {
            console.error("Error buscando exámenes clínicos:", error);

            return {
                status: 500,
                message: "Error interno al buscar los exámenes clínicos",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async create(consultationId: number, data: CreateClinicalExaminationDto) {
        try {
            const item = await prisma.clinicalExamination.create({
                data: {
                    consultation_id: consultationId,
                    weight: data.weight ?? null,
                    height: data.height ?? null,
                    temperature: data.temperature ?? null,
                    systolic_bp: data.systolic_bp ?? null,
                    diastolic_bp: data.diastolic_bp ?? null,
                    heart_rate: data.heart_rate ?? null,
                    respiratory_rate: data.respiratory_rate ?? null,
                    oxygen_saturation: data.oxygen_saturation ?? null,
                },
                select: clinicalExaminationSelect,
            });

            return {
                status: 201,
                message: "Examen clínico creado éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error creando examen clínico:", error);

            return {
                status: 500,
                message: "Error interno al crear el examen clínico",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(consultationId: number, clinicalExaminationId: number, data: UpdateClinicalExaminationDto) {
        try {
            const item = await prisma.clinicalExamination.update({
                where: { id: clinicalExaminationId },
                data: {
                    consultation_id: consultationId,
                    weight: data.weight ?? undefined,
                    height: data.height ?? undefined,
                    temperature: data.temperature ?? undefined,
                    systolic_bp: data.systolic_bp ?? undefined,
                    diastolic_bp: data.diastolic_bp ?? undefined,
                    heart_rate: data.heart_rate ?? undefined,
                    respiratory_rate: data.respiratory_rate ?? undefined,
                    oxygen_saturation: data.oxygen_saturation ?? undefined,
                },
                select: clinicalExaminationSelect,
            });

            return {
                status: 200,
                message: "Examen clínico actualizado éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error actualizando examen clínico:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el examen clínico",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(consultationId: number, clinicalExaminationId: number) {
        try {
            const item = await prisma.clinicalExamination.delete({
                where: { id: clinicalExaminationId },
                select: clinicalExaminationSelect,
            });

            return {
                status: 200,
                message: "Examen clínico eliminado éxitosamente",
                data: item,
            };
        } catch (error) {
            console.error("Error eliminando examen clínico:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el examen clínico",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
