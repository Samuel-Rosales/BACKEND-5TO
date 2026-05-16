import { prisma } from "@/configs";
import type { CreateSymptomDto, UpdateSymptomDto } from "./symptoms.interface";

const symptomSelect = {
    id: true,
    name: true,
} as const;

export class SymptomsService {
    async create(data: CreateSymptomDto) {
        try {
            const symptom = await prisma.symptoms.create({
                data: {
                    name: data.name.trim(),
                },
                select: symptomSelect,
            });

            if (!symptom) {
                throw new Error("Error creando el síntoma");
            }

            return {
                status: 201,
                message: "Síntoma creado éxitosamente",
                data: symptom,
            };
        } catch (error) {
            console.error("Error creando el síntoma:", error);

            return {
                status: 500,
                message: "Error interno al crear el síntoma",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll(search?: string) {
        try {
            const symptoms = await prisma.symptoms.findMany({
                where: search
                    ? {
                          name: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      }
                    : undefined,
                orderBy: { name: "asc" },
                select: symptomSelect,
            });

            if (!symptoms) {
                throw new Error("Error buscando síntomas");
            }

            if (symptoms.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron síntomas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Síntomas encontrados éxitosamente",
                data: symptoms,
            };
        } catch (error) {
            console.error("Error buscando síntomas:", error);

            return {
                status: 500,
                message: "Error interno al buscar los síntomas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const symptom = await prisma.symptoms.findUnique({
                where: { id },
                select: symptomSelect,
            });

            if (!symptom) {
                throw new Error("Error buscando el síntoma");
            }

            return {
                status: 200,
                message: "Síntoma encontrado éxitosamente",
                data: symptom,
            };
        } catch (error) {
            console.error("Error buscando el síntoma:", error);

            return {
                status: 500,
                message: "Error interno al buscar el síntoma",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateSymptomDto) {
        try {
            const symptom = await prisma.symptoms.update({
                where: { id },
                data: {
                    name: data.name?.trim(),
                },
                select: symptomSelect,
            });

            if (!symptom) {
                throw new Error("Error actualizando el síntoma");
            }

            return {
                status: 200,
                message: "Síntoma actualizado éxitosamente",
                data: symptom,
            };
        } catch (error) {
            console.error("Error actualizando el síntoma:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el síntoma",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const symptom = await prisma.symptoms.delete({
                where: { id },
                select: symptomSelect,
            });

            if (!symptom) {
                throw new Error("Error eliminando el síntoma");
            }

            return {
                status: 200,
                message: "Síntoma eliminado éxitosamente",
                data: symptom,
            };
        } catch (error) {
            console.error("Error eliminando el síntoma:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el síntoma",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
