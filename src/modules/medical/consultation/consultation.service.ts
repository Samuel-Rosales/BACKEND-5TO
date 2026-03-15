import { prisma } from "@/configs";
import { CreateConsultationDto, UpdateConsultationDto } from "./consultation.interface";

const consultationSelect = {
    id: true,
    appointmentId: true,
    patientId: true,
    doctorId: true,
    date: true,
    started_at: true,
    finished_at: true,
    symptoms: true,
    diagnosis: true,
    physical_exam: true,
    patient: {
        select: {
            id: true,
            userId: true,
            tipo_sangre: true,
            active: true,
            user: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                },
            },
        },
    },
    doctor: {
        select: {
            id: true,
            userId: true,
            specialtyId: true,
            user: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                },
            },
            specialty: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
} as const;

export class ConsultationService {

    async create(data: CreateConsultationDto) {
        try {
            const consultation = await prisma.consultation.create({
                data,
                select: consultationSelect,
            });

            if (!consultation) {
                throw new Error("Error creando la consulta");
            }

            return {
                status: 201,
                message: "Consulta creada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error creando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al crear la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const consultations = await prisma.consultation.findMany({
                orderBy: { date: "desc" },
                select: consultationSelect,
            });

            if (!consultations) {
                throw new Error("Error buscando consultas");
            }

            if (consultations.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron consultas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Consultas encontradas éxitosamente",
                data: consultations,
            };
        } catch (error) {
            console.error("Error buscando consultas:", error);

            return {
                status: 500,
                message: "Error interno al buscar las consultas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const consultation = await prisma.consultation.findUnique({
                where: { id },
                select: consultationSelect,
            });

            if (!consultation) {
                throw new Error("Error buscando la consulta");
            }

            return {
                status: 200,
                message: "Consulta encontrada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error buscando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al buscar la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateConsultationDto) {
        try {
            const consultation = await prisma.consultation.update({
                where: { id },
                data,
                select: consultationSelect,
            });

            if (!consultation) {
                throw new Error("Error actualizando la consulta");
            }

            return {
                status: 200,
                message: "Consulta actualizada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error actualizando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const consultation = await prisma.consultation.delete({
                where: { id },
                select: consultationSelect,
            });

            if (!consultation) {
                throw new Error("Error eliminando la consulta");
            }

            return {
                status: 200,
                message: "Consulta eliminada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error eliminando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
