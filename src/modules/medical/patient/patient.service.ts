import { prisma } from "@/configs";
import { CreatePatientDto, UpdatePatientDto, PatientSearchParams, CreateInfoPatientDto } from "./patient.interface";

const patientSelect = {
    id: true,
    userId: true,
    ci: true,
    name: true,
    active: true,
    last_visit_at: true,
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
    info_patient: true,
} as const;

export class PatientService {

    async create(data: CreatePatientDto, creatorUserId?: number) {
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
            } else if (creatorUserId) {
                resolvedUser = await prisma.user.findUnique({
                    where: { id: creatorUserId },
                    select: { id: true, ci: true, name: true },
                });
                
                if (resolvedUser) {
                    data.userId = resolvedUser.id;
                }
            }

            const payload: CreatePatientDto = {
                ci: data.ci ?? resolvedUser?.ci,
                name: data.name ?? resolvedUser?.name
            };

            const createData: any = {
                ci: payload.ci,
                name: payload.name
            };

            if (data.userId) {
                createData.user = { connect: { id: data.userId } };
            }

            let patient;
            
            if (data.infoPatient) {
                patient = await prisma.patient.create({
                    data: {
                        ...createData,
                        info_patient: {
                            create: {
                                ci: data.infoPatient.ci,
                                name: data.infoPatient.name,
                                last_name: data.infoPatient.last_name,
                                sex: data.infoPatient.sex,
                                birth_date: new Date(data.infoPatient.birth_date),
                                blood_type: data.infoPatient.blood_type,
                                nacionality: data.infoPatient.nacionality,
                                profession: data.infoPatient.profession,
                                main_phone: data.infoPatient.main_phone,
                                secondary_phone: data.infoPatient.secondary_phone,
                                email: data.infoPatient.email,
                                address: data.infoPatient.address,
                                city: data.infoPatient.city,
                                allergies: data.infoPatient.allergies,
                                chronic_diseases: data.infoPatient.chronic_diseases,
                                current_medications: data.infoPatient.current_medications,
                                previous_surgeries: data.infoPatient.previous_surgeries,
                            }
                        }
                    },
                    select: patientSelect,
                });
            } else {
                patient = await prisma.patient.create({
                    data: createData,
                    select: patientSelect,
                });
            }

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

    async findAll(params?: PatientSearchParams) {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 20;
            const skip = (page - 1) * limit;

            const where: any = { active: true };

            if (params?.ci) {
                where.ci = { contains: params.ci, mode: 'insensitive' };
            }

            if (params?.name) {
                where.name = { contains: params.name, mode: 'insensitive' };
            }

            if (params?.userId) {
                where.userId = params.userId;
            }

            const [patients, total] = await Promise.all([
                prisma.patient.findMany({
                    where,
                    orderBy: { id: "desc" },
                    skip,
                    take: limit,
                    select: patientSelect,
                }),
                prisma.patient.count({ where }),
            ]);

            if (!patients) {
                throw new Error("Error buscando pacientes");
            }

            return {
                status: 200,
                message: "Pacientes encontrados éxitosamente",
                data: patients,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
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
            const patients = await prisma.patient.findMany({
                where: { active: true, userId: userId },
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

    async findByCI(ci: string) {
        try {
            const patient = await prisma.patient.findFirst({
                where: { 
                    OR: [
                        { ci: { equals: ci, mode: 'insensitive' } },
                        { info_patient: { ci: { equals: ci, mode: 'insensitive' } } }
                    ],
                    active: true 
                },
                select: patientSelect,
            });

            if (!patient) {
                return {
                    status: 404,
                    message: "Paciente no encontrado",
                    error: "No encontrado",
                };
            }

            return {
                status: 200,
                message: "Paciente encontrado éxitosamente",
                data: patient,
            };
        } catch (error) {
            console.error("Error buscando el paciente por CI:", error);

            return {
                status: 500,
                message: "Error interno al buscar el paciente",
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
