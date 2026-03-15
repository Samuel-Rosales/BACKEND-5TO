import { prisma } from "@/configs";
import { CreateRoleDto, UpdateRoleDto } from "./role.interface";

export class RoleService {

    async create(data: CreateRoleDto) {

        try {
            const role = await prisma.role.create({ data });

            if (!role) {
                throw new Error("Error creando el rol");
            }

            return {
                status: 201,
                message: "Rol creado éxitosamente",
                data: role,
            };
        } catch (error) {
            console.error("Error creando el rol:", error);

            return {
                status: 500,
                message: "Error interno al crear el rol",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const roles = await prisma.role.findMany({ where: { active: true } });

            if (!roles) {
                throw new Error("Error buscando roles");
            }

            if (roles.length === 0) {
                return {
                status: 200,
                message: "No se encontraron roles",
                data: [],
                };
            }

            return {
                status: 200,
                message: "Roles encontrados éxitosamente",
                data: roles,
            };
        } catch (error) {
            console.error("Error buscando roles:", error);

            return {
                status: 500,
                message: "Error interno al buscar los roles",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const role = await prisma.role.findUnique({ where: { id, active: true } });

            if (!role) {
                throw new Error("Error buscando el rol");
            }

            return {
                status: 200,
                message: "Rol encontrado éxitosamente",
                data: role,
            };
        } catch (error) {
            console.error("Error buscando el rol:", error);

            return {
                status: 500,
                message: "Error interno al buscar el rol",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateRoleDto) {
        try {
            const role = await prisma.role.update({ where: { id, active: true }, data });

            if (!role) {
                throw new Error("Error actualizando el rol");
            }

            return {
                status: 200,
                message: "Rol actualizado éxitosamente",
                data: role,
            };
        } catch (error) {
            console.error("Error actualizando el rol:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el rol",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const role = await prisma.role.update({ where: { id, active: true }, data: { active: false } });

            if (!role) {
                throw new Error("Error eliminando el rol");
            }

            return {
                status: 200,
                message: "Rol eliminado éxitosamente",
                data: role,
            };
        } catch (error) {
            console.error("Error eliminando el rol:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el rol",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}