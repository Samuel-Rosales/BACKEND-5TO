import { prisma } from "@/configs";
import { CreateSupplyConsultationDto, UpdateSupplyConsultationDto } from "./supplyConsultation.interface";

const supplyConsultationSelect = {
    id: true,
    supplyId: true,
    consultationId: true,
    quantity: true,
    supply: {
        select: {
            id: true,
            name: true,
            sku: true,
            active: true,
        },
    },
    consultation: {
        select: {
            id: true,
            patientId: true,
            doctorId: true,
            date: true,
            started_at: true,
            finished_at: true,
        },
    },
} as const;

export class SupplyConsultationService {

    async create(data: CreateSupplyConsultationDto) {
        try {
            const supply = await prisma.supplyConsultation.create({
                data: {
                    supplyId: data.supplyId,
                    consultationId: data.consultationId,
                    quantity: data.quantity as any,
                },
                select: supplyConsultationSelect,
            });

            if (!supply) {
                throw new Error("Error creando el suministro");
            }

            return {
                status: 201,
                message: "Suministro creado éxitosamente",
                data: supply,
            };
        } catch (error) {
            console.error("Error creando el suministro:", error);

            return {
                status: 500,
                message: "Error interno al crear el suministro",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const supplies = await prisma.supplyConsultation.findMany({
                orderBy: { id: "desc" },
                select: supplyConsultationSelect,
            });

            if (!supplies) {
                throw new Error("Error buscando suministros");
            }

            if (supplies.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron suministros",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Suministros encontrados éxitosamente",
                data: supplies,
            };
        } catch (error) {
            console.error("Error buscando suministros:", error);

            return {
                status: 500,
                message: "Error interno al buscar los suministros",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const supply = await prisma.supplyConsultation.findUnique({
                where: { id },
                select: supplyConsultationSelect,
            });

            if (!supply) {
                throw new Error("Error buscando el suministro");
            }

            return {
                status: 200,
                message: "Suministro encontrado éxitosamente",
                data: supply,
            };
        } catch (error) {
            console.error("Error buscando el suministro:", error);

            return {
                status: 500,
                message: "Error interno al buscar el suministro",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateSupplyConsultationDto) {
        try {
            const supply = await prisma.supplyConsultation.update({
                where: { id },
                data: {
                    supplyId: data.supplyId,
                    consultationId: data.consultationId,
                    quantity: data.quantity as any,
                },
                select: supplyConsultationSelect,
            });

            if (!supply) {
                throw new Error("Error actualizando el suministro");
            }

            return {
                status: 200,
                message: "Suministro actualizado éxitosamente",
                data: supply,
            };
        } catch (error) {
            console.error("Error actualizando el suministro:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el suministro",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const supply = await prisma.supplyConsultation.delete({
                where: { id },
                select: supplyConsultationSelect,
            });

            if (!supply) {
                throw new Error("Error eliminando el suministro");
            }

            return {
                status: 200,
                message: "Suministro eliminado éxitosamente",
                data: supply,
            };
        } catch (error) {
            console.error("Error eliminando el suministro:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el suministro",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
