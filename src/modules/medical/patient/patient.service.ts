import { prisma } from "@/configs";
import { CreatePatientDto, CreatePatientFromReceptionDto, UpdatePatientDto } from "./patient.interface";
import bcrypt from "bcryptjs";

const patientSelect = {
    id: true,
    userId: true,
    ci: true,
    name: true,
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

    async createFromReception(data: CreatePatientFromReceptionDto) {
        try {
            const rolePatient = await prisma.role.findFirst({
                where: { code: "PATIENT", active: true },
                select: { id: true },
            });

            if (!rolePatient) {
                return {
                    status: 500,
                    message: "Rol PATIENT no encontrado",
                    error: "Configuración",
                };
            }

            const ci = String(data.ci).trim();
            const name = String(data.name).trim();

            const existingUser = await prisma.user.findFirst({
                where: { ci, active: true },
                select: { id: true },
            });

            if (existingUser) {
                return {
                    status: 400,
                    message: "Ya existe un usuario con esa cédula",
                    error: "Validación",
                };
            }

            const existingPatientByCi = await prisma.patient.findFirst({
                where: { ci, active: true },
                select: { id: true },
            });

            if (existingPatientByCi) {
                return {
                    status: 400,
                    message: "Ya existe un paciente activo con esa cédula",
                    error: "Validación",
                };
            }

            const result = await prisma.$transaction(async (tx) => {
                // Manual create here to keep user+patient atomic in the same transaction.
                const hashedPassword = await bcrypt.hash(ci, 10);

                const user = await tx.user.create({
                    data: {
                        ci,
                        name,
                        password: hashedPassword,
                        roleId: rolePatient.id,
                        active: true,
                    },
                    select: { id: true },
                });

                const createdPatient = await tx.patient.create({
                    data: {
                        userId: user.id,
                        ci,
                        name,
                    },
                    select: patientSelect,
                });

                return createdPatient;
            });

            return {
                status: 201,
                message: "Paciente (y usuario) creado éxitosamente",
                data: result,
            };
        } catch (error) {
            console.error("Error creando paciente desde recepción:", error);

            return {
                status: 500,
                message: "Error interno al crear el paciente",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async create(data: CreatePatientDto) {
        try {
            const resolvedUser = await prisma.user.findUnique({
                where: { id: data.userId },
                select: {
                    id: true,
                    ci: true,
                    name: true,
                    active: true,
                    role: { select: { code: true } },
                },
            });

            if (!resolvedUser || !resolvedUser.active) {
                return {
                    status: 400,
                    message: "El usuario no existe o no está activo",
                    error: "Validación",
                };
            }

            // Optional but consistent with Doctor creation rules.
            if (resolvedUser.role?.code !== "PATIENT") {
                return {
                    status: 400,
                    message: "El usuario debe tener el rol de paciente",
                    error: "Validación",
                };
            }

            const existing = await prisma.patient.findFirst({
                where: { userId: data.userId, active: true },
                select: { id: true },
            });

            if (existing) {
                return {
                    status: 400,
                    message: "Ese usuario ya tiene un paciente asociado",
                    error: "Validación",
                };
            }

            const payload = {
                ci: data.ci ?? resolvedUser.ci,
                name: data.name ?? resolvedUser.name,
            };

            const createData = {
                user: { connect: { id: data.userId } },
                ci: payload.ci,
                name: payload.name,
            };

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

    async findAllFromUser(userId: number) {
        try {
            const patient = await prisma.patient.findFirst({
                where: { active: true, userId },
                select: patientSelect,
            });

            if (!patient) {
                return {
                    status: 404,
                    message: "Paciente no encontrado para este usuario",
                    data: null,
                };
            }

            return {
                status: 200,
                message: "Paciente encontrado éxitosamente",
                data: patient,
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
                select: { id: true, userId: true },
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

            if (data.userId !== undefined) {
                const newUserId = Number(data.userId);
                if (!Number.isFinite(newUserId) || newUserId <= 0) {
                    return {
                        status: 400,
                        message: "El userId debe ser un número entero positivo",
                        error: "Validación",
                    };
                }

                if (newUserId !== existing.userId) {
                    const occupied = await prisma.patient.findFirst({
                        where: { userId: newUserId, active: true, id: { not: id } },
                        select: { id: true },
                    });

                    if (occupied) {
                        return {
                            status: 400,
                            message: "Ese usuario ya tiene un paciente asociado",
                            error: "Validación",
                        };
                    }
                }

                updateData.user = { connect: { id: newUserId } };
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
