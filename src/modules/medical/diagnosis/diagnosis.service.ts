import { prisma } from "@/configs";
import type { CreateDiagnosisDto, UpdateDiagnosisDto } from "./diagnosis.interface";

const diagnosisSelect = {
    id: true,
    code: true,
    description: true,
    category: true,
} as const;

export class DiagnosisService {
    async create(data: CreateDiagnosisDto) {
        try {
            const diagnosis = await prisma.diagnosis.create({
                data: {
                    code: data.code.trim(),
                    description: data.description.trim(),
                    category: data.category.trim(),
                },
                select: diagnosisSelect,
            });

            if (!diagnosis) {
                throw new Error("Error creando el diagnóstico");
            }

            return {
                status: 201,
                message: "Diagnóstico creado éxitosamente",
                data: diagnosis,
            };
        } catch (error) {
            console.error("Error creando el diagnóstico:", error);

            return {
                status: 500,
                message: "Error interno al crear el diagnóstico",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll(search?: string) {
        try {
            const where = search
                ? {
                      OR: [
                          { description: { contains: search, mode: "insensitive" as const } },
                          { code: { contains: search, mode: "insensitive" as const } },
                      ],
                  }
                : undefined;

            const diagnoses = await prisma.diagnosis.findMany({
                where,
                orderBy: [{ code: "asc" }, { description: "asc" }],
                select: diagnosisSelect,
            });

            if (!diagnoses) {
                throw new Error("Error buscando diagnósticos");
            }

            if (diagnoses.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron diagnósticos",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Diagnósticos encontrados éxitosamente",
                data: diagnoses,
            };
        } catch (error) {
            console.error("Error buscando diagnósticos:", error);

            return {
                status: 500,
                message: "Error interno al buscar los diagnósticos",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const diagnosis = await prisma.diagnosis.findUnique({
                where: { id },
                select: diagnosisSelect,
            });

            if (!diagnosis) {
                throw new Error("Error buscando el diagnóstico");
            }

            return {
                status: 200,
                message: "Diagnóstico encontrado éxitosamente",
                data: diagnosis,
            };
        } catch (error) {
            console.error("Error buscando el diagnóstico:", error);

            return {
                status: 500,
                message: "Error interno al buscar el diagnóstico",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateDiagnosisDto) {
        try {
            const diagnosis = await prisma.diagnosis.update({
                where: { id },
                data: {
                    code: data.code?.trim(),
                    description: data.description?.trim(),
                    category: data.category?.trim(),
                },
                select: diagnosisSelect,
            });

            if (!diagnosis) {
                throw new Error("Error actualizando el diagnóstico");
            }

            return {
                status: 200,
                message: "Diagnóstico actualizado éxitosamente",
                data: diagnosis,
            };
        } catch (error) {
            console.error("Error actualizando el diagnóstico:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el diagnóstico",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const diagnosis = await prisma.diagnosis.delete({
                where: { id },
                select: diagnosisSelect,
            });

            if (!diagnosis) {
                throw new Error("Error eliminando el diagnóstico");
            }

            return {
                status: 200,
                message: "Diagnóstico eliminado éxitosamente",
                data: diagnosis,
            };
        } catch (error) {
            console.error("Error eliminando el diagnóstico:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el diagnóstico",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
