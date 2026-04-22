import { prisma } from "@/configs";
import { CreatePatientDto, UpdatePatientDto } from "./patient.interface";

const patientSelect = {
    id: true,
    userId: true,
    ci: true,
    name: true,
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
            let resolvedUser: { id: number; ci: string; name: string } | null = null;
            if (data.userId) {
                resolvedUser = await prisma.user.findUnique({
                    where: { id: data.userId },
                    select: { id: true, ci: true, name: true },
                });

                if (!resolvedUser) {
                    return {
                        status: 400,
                        message: "El usuario no existe",
                        error: "Validación",
                    };
                }
            }

            const payload: CreatePatientDto = {
                ci: data.ci ?? resolvedUser?.ci,
                name: data.name ?? resolvedUser?.name,
                tipo_sangre: data.tipo_sangre,
                medical_history: data.medical_history,
            };

            const createData: any = {
                ci: payload.ci,
                name: payload.name,
                tipo_sangre: payload.tipo_sangre,
                medical_history: payload.medical_history,
            };

            if (data.userId) {
                createData.user = { connect: { id: data.userId } };
            }

            const patient = await prisma.patient.create({
                data: createData,
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
            const patient = await prisma.patient.findFirst({
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
            const existing = await prisma.patient.findFirst({
                where: { id, active: true },
                select: { id: true },
            });

            if (!existing) {
                return {
                    status: 404,
                    message: "El paciente no existe o no está activo",
                    error: "No encontrado",
                };
            }

            const updateData: any = {};

            if (data.ci !== undefined) updateData.ci = data.ci;
            if (data.name !== undefined) updateData.name = data.name;
            if (data.tipo_sangre !== undefined) updateData.tipo_sangre = data.tipo_sangre;
            if (data.medical_history !== undefined) updateData.medical_history = data.medical_history;

            if (data.userId !== undefined) {
                updateData.user = { connect: { id: data.userId } };
            }

            if (Object.keys(updateData).length === 0) {
                return {
                    status: 400,
                    message: "No hay campos válidos para actualizar",
                    error: "Validación",
                };
            }

            const patient = await prisma.patient.update({
                where: { id },
                data: updateData,
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
            const existing = await prisma.patient.findFirst({
                where: { id, active: true },
                select: { id: true },
            });

            if (!existing) {
                return {
                    status: 404,
                    message: "El paciente no existe o no está activo",
                    error: "No encontrado",
                };
            }

            const patient = await prisma.patient.update({
                where: { id },
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
