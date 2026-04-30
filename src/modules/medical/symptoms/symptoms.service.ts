import { prisma } from "@/configs";

export class SymptomsService {
    async findAll(search?: string) {
        try {
            const symptoms = await prisma.symptoms.findMany({
                where: search ? {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                } : undefined,
                orderBy: { name: "asc" },
                select: {
                    id: true,
                    name: true,
                }
            });

            return {
                status: 200,
                message: "Síntomas obtenidos éxitosamente",
                data: symptoms,
            };
        } catch (error) {
            console.error("Error buscando síntomas:", error);
            return {
                status: 500,
                message: "Error interno al buscar síntomas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
