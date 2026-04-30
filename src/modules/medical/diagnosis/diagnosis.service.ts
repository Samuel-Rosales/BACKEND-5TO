import { prisma } from "@/configs";

export class DiagnosisService {
    async findAll(search?: string) {
        try {
            const diagnoses = await prisma.diagnosis.findMany({
                where: search ? {
                    OR: [
                        { description: { contains: search, mode: "insensitive" } },
                        { code: { contains: search, mode: "insensitive" } }
                    ]
                } : undefined,
                orderBy: { description: "asc" },
                select: {
                    id: true,
                    code: true,
                    description: true,
                    category: true,
                }
            });

            return {
                status: 200,
                message: "Diagnósticos obtenidos éxitosamente",
                data: diagnoses,
            };
        } catch (error) {
            console.error("Error buscando diagnósticos:", error);
            return {
                status: 500,
                message: "Error interno al buscar diagnósticos",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
