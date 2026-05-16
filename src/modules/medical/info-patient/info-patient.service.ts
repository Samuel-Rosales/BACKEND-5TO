import { prisma } from "@/configs";
import { CreateInfoPatientDto, UpdateInfoPatientDto } from "./info-patient.interface";

export class InfoPatientService {

    async create(data: CreateInfoPatientDto, patientId: number) {
        try {
            const patient = await prisma.patient.findUnique({
                where: { id: patientId },
                select: { id: true },
            });

            if (!patient) {
                return {
                    status: 400,
                    message: "El paciente no existe",
                    error: "Validación",
                };
            }

            const infoPatient = await prisma.infoPatient.create({
                data: {
                    ...data,
                    patientId: patient.id,
                }
            });

            return {
                status: 201,
                message: "Información del paciente creada exitosamente",
                data: infoPatient,
            };
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: "Error creating info patient",
                error: "Error interno",
            };
        }
    }

    async findAll() {
        try {
            const items = await prisma.infoPatient.findMany({
                where: { active: true },
                orderBy: { id: "desc" },
            });

            return {
                status: 200,
                message: items.length === 0 ? "No se encontró información" : "Información encontrada",
                data: items,
            };
        } catch (error) {
            return {
                status: 500,
                message: "Error finding info patient",
                error: "Error interno",
            };
        }
    }

    async findByPatientId(patientId: number) {
        try {
            const infoPatient = await prisma.infoPatient.findUnique({
                where: { patientId },
                include: {
                    patient: {
                        select: {
                            id: true,
                            name: true,
                            ci: true,
                        },
                    },
                },
            });

            if (!infoPatient || !infoPatient.active) {
                return {
                    status: 404,
                    message: "Información del paciente no encontrada",
                    error: "No encontrado",
                };
            }

            return {
                status: 200,
                message: "Información del paciente encontrada",
                data: infoPatient,
            };
        } catch (error) {
            
            return {
                status: 500,
                message: "Error finding info patient",
                error: "Error interno",
            };
        }
    }

    async updateByPatientId(patientId: number, data: UpdateInfoPatientDto) {
        try {
            const existing = await prisma.infoPatient.findUnique({
                where: { patientId },
            });

            if (!existing) {
                const patient = await prisma.patient.findUnique({
                    where: { id: patientId },
                    select: { id: true },
                });

                if (!patient) {
                    return {
                        status: 404,
                        message: "El paciente no existe",
                        error: "No encontrado",
                    };
                }

                const created = await prisma.infoPatient.create({
                    data: {
                        patientId,
                        sex: data.sex || 'MALE',
                        birth_date: data.birth_date ? new Date(data.birth_date) : new Date(),
                    },
                });

                return {
                    status: 201,
                    message: "Información del paciente creada",
                    data: created,
                };
            }

            const updated = await prisma.infoPatient.update({
                where: { patientId },
                data,
            });

            return {
                status: 200,
                message: "Información del paciente actualizada",
                data: updated,
            };
        } catch (error) {
            console.error("Error updating info patient:", error);
            return {
                status: 500,
                message: "Error updating info patient",
                error: "Error interno",
            };
        }
    }

    async deleteByPatientId(patientId: number) {
        try {
            const existing = await prisma.infoPatient.findUnique({
                where: { patientId },
                select: { id: true },
            });

            if (!existing) {
                return {
                    status: 404,
                    message: "Información del paciente no encontrada",
                    error: "No encontrado",
                };
            }

            const deleted = await prisma.infoPatient.update({
                where: { patientId },
                data: { active: false },
            });

            return {
                status: 200,
                message: "Información del paciente eliminada",
                data: deleted,
            };
        } catch (error) {
            return {
                status: 500,
                message: "Error deleting info patient",
                error: "Error interno",
            };
        }
    }
}