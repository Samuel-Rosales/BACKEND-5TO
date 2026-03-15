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
} as const;

export class UserService {

    async create(data: CreateUserDto) {
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = await prisma.user.create({
                data: {
                    ...data,
                    password: hashedPassword,
                },
                select: userSelect,
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

            if (dataToUpdate.password) {
                dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
            }

            const user = await prisma.user.update({
                where: { id, active: true },
                data: dataToUpdate,
                select: userSelect,
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
