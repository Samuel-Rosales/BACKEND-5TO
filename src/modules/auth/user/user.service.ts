import { prisma } from "@/configs";
import bcrypt from "bcryptjs";
import { CreateUserDto, UpdateUserDto } from "./user.interface";

const userSelect = {
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
    doctor: {
        select: {
            id: true,
            specialtyId: true,
            specialty: {
                select: {
                    id: true,
                    name: true,
                    consultation_price: true,
                    commission_percentage: true,
                },
            },
        },
    },
} as const;

export class UserService {

    async create(data: CreateUserDto) {
        try {
            const role = await prisma.role.findFirst({
                where: { id: data.roleId, active: true },
                select: { id: true, code: true },
            });

            if (!role) {
                return {
                    status: 400,
                    message: "El rol no existe o no está activo",
                    error: "Validación",
                };
            }

            const specialtyId = data.specialtyId ? Number(data.specialtyId) : null;

            if (role.code === "DOCTOR" && !specialtyId) {
                return {
                    status: 400,
                    message: "Debe seleccionar una especialidad para el doctor",
                    error: "Validación",
                };
            }

            if (role.code !== "DOCTOR" && specialtyId) {
                return {
                    status: 400,
                    message: "La especialidad solo aplica para usuarios con rol de doctor",
                    error: "Validación",
                };
            }

            if (specialtyId) {
                const specialty = await prisma.medicalSpecialty.findFirst({
                    where: { id: specialtyId, active: true },
                    select: { id: true },
                });

                if (!specialty) {
                    return {
                        status: 400,
                        message: "La especialidad no existe o no está activa",
                        error: "Validación",
                    };
                }
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = await prisma.$transaction(async (tx) => {
                const createdUser = await tx.user.create({
                    data: {
                        ci: data.ci.trim(),
                        name: data.name.trim(),
                        password: hashedPassword,
                        roleId: data.roleId,
                    },
                    select: { id: true },
                });

                if (role.code === "DOCTOR" && specialtyId) {
                    await tx.doctor.create({
                        data: {
                            userId: createdUser.id,
                            specialtyId,
                        },
                    });
                }

                return tx.user.findUnique({
                    where: { id: createdUser.id },
                    select: userSelect,
                });
            });

            if (!user) {
                throw new Error("Error creando el usuario");
            }

            return {
                status: 201,
                message: "Usuario creado éxitosamente",
                data: user,
            };
        } catch (error) {
            console.error("Error creando el usuario:", error);

            return {
                status: 500,
                message: "Error interno al crear el usuario",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const users = await prisma.user.findMany({
                where: { active: true },
                select: userSelect,
            });

            if (!users) {
                throw new Error("Error buscando usuarios");
            }

            if (users.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron usuarios",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Usuarios encontrados éxitosamente",
                data: users,
            };
        } catch (error) {
            console.error("Error buscando usuarios:", error);

            return {
                status: 500,
                message: "Error interno al buscar los usuarios",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const user = await prisma.user.findUnique({
                where: { id, active: true },
                select: userSelect,
            });

            if (!user) {
                throw new Error("Error buscando el usuario");
            }

            return {
                status: 200,
                message: "Usuario encontrado éxitosamente",
                data: user,
            };
        } catch (error) {
            console.error("Error buscando el usuario:", error);

            return {
                status: 500,
                message: "Error interno al buscar el usuario",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateUserDto) {
        try {
            const dataToUpdate: UpdateUserDto = { ...data };
            const specialtyId = dataToUpdate.specialtyId ? Number(dataToUpdate.specialtyId) : undefined;

            delete dataToUpdate.specialtyId;

            if (dataToUpdate.password) {
                dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
            }

            if (specialtyId !== undefined) {
                const specialty = await prisma.medicalSpecialty.findFirst({
                    where: { id: specialtyId, active: true },
                    select: { id: true },
                });

                if (!specialty) {
                    return {
                        status: 400,
                        message: "La especialidad no existe o no está activa",
                        error: "Validación",
                    };
                }
            }

            const user = await prisma.$transaction(async (tx) => {
                const existingDoctor = await tx.doctor.findUnique({
                    where: { userId: id },
                    select: { id: true },
                });

                const updatedUser = await tx.user.update({
                    where: { id, active: true },
                    data: dataToUpdate,
                    select: userSelect,
                });

                const roleCode = updatedUser.role?.code;
                const isDoctor = roleCode === "DOCTOR";

                if (isDoctor && !existingDoctor && specialtyId === undefined) {
                    throw new Error("Debe seleccionar una especialidad para el doctor");
                }

                if (isDoctor && specialtyId !== undefined) {
                    if (existingDoctor) {
                        await tx.doctor.update({
                            where: { userId: id },
                            data: { specialtyId },
                        });
                    } else {
                        await tx.doctor.create({
                            data: {
                                userId: id,
                                specialtyId,
                            },
                        });
                    }
                } else if (!isDoctor && existingDoctor) {
                    await tx.doctor.delete({
                        where: { userId: id },
                    });
                }

                return tx.user.findUnique({
                    where: { id },
                    select: userSelect,
                });
            });

            if (!user) {
                throw new Error("Error actualizando el usuario");
            }

            return {
                status: 200,
                message: "Usuario actualizado éxitosamente",
                data: user,
            };
        } catch (error) {
            console.error("Error actualizando el usuario:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el usuario",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const user = await prisma.user.update({
                where: { id, active: true },
                data: { active: false },
                select: userSelect,
            });

            if (!user) {
                throw new Error("Error eliminando el usuario");
            }

            return {
                status: 200,
                message: "Usuario eliminado éxitosamente",
                data: user,
            };
        } catch (error) {
            console.error("Error eliminando el usuario:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el usuario",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
