import { prisma } from "@/configs";
import { CreatePatientDto, UpdatePatientDto } from "./patient.interface";

const patientSelect = {
    id: true,
    userId: true,
    tipo_sangre: true,
    medical_history: true,
    active: true,
    user: {
        select: {
            id: true,
            ci: true,
            name: true,
            roleId: true,
            active: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    },
} as const;

export class PatientService {

    async create(data: CreatePatientDto) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: data.userId },
                include: { role: true },
            });

            if (user?.role.code !== "PATIENT") {
                return {
                    status: 400,
                    message: "El usuario debe tener el rol de paciente",
                };
            }
            const patient = await prisma.patient.create({
                data,
                select: patientSelect,
            });

            if (!patient) {
                throw new Error("Error creando el paciente");
            }

            return {
                status: 201,
                message: "Paciente creado éxitosamente",
                data: patient,
            };
        } catch (error) {
            console.error("Error creando el paciente:", error);

            return {
                status: 500,
                message: "Error interno al crear el paciente",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const patients = await prisma.patient.findMany({
                where: { active: true },
                orderBy: { id: "desc" },
                select: patientSelect,
            });

            if (!patients) {
                throw new Error("Error buscando pacientes");
            }

            if (patients.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron pacientes",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Pacientes encontrados éxitosamente",
                data: patients,
            };
        } catch (error) {
            console.error("Error buscando pacientes:", error);

            return {
                status: 500,
                message: "Error interno al buscar los pacientes",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const patient = await prisma.patient.findUnique({
                where: { id, active: true },
                select: patientSelect,
            });

            if (!patient) {
                throw new Error("Error buscando el paciente");
            }

            return {
                status: 200,
                message: "Paciente encontrado éxitosamente",
                data: patient,
            };
        } catch (error) {
            console.error("Error buscando el paciente:", error);

            return {
                status: 500,
                message: "Error interno al buscar el paciente",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdatePatientDto) {
        try {
            const patient = await prisma.patient.update({
                where: { id, active: true },
                data,
                select: patientSelect,
            });

            if (!patient) {
                throw new Error("Error actualizando el paciente");
            }

            return {
                status: 200,
                message: "Paciente actualizado éxitosamente",
                data: patient,
            };
        } catch (error) {
            console.error("Error actualizando el paciente:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el paciente",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const patient = await prisma.patient.update({
                where: { id, active: true },
                data: { active: false },
                select: patientSelect,
            });

            if (!patient) {
                throw new Error("Error eliminando el paciente");
            }

            return {
                status: 200,
                message: "Paciente eliminado éxitosamente",
                data: patient,
            };
        } catch (error) {
            console.error("Error eliminando el paciente:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el paciente",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
