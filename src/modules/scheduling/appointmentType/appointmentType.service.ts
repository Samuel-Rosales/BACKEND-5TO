import { prisma } from "@/configs";
import { CreateAppointmentTypeDto, UpdateAppointmentTypeDto } from "./appointmentType.interface";

const appointmentTypeSelect = {
    id: true,
    name: true,
} as const;

export class AppointmentTypeService {

    async create(data: CreateAppointmentTypeDto) {
        try {
            const type = await prisma.appointmentType.create({
                data,
                select: appointmentTypeSelect,
            });

            if (!type) {
                throw new Error("Error creando el tipo de cita");
            }

            return {
                status: 201,
                message: "Tipo de cita creado éxitosamente",
                data: type,
            };
        } catch (error) {
            console.error("Error creando el tipo de cita:", error);

            return {
                status: 500,
                message: "Error interno al crear el tipo de cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const types = await prisma.appointmentType.findMany({
                orderBy: { id: "asc" },
                select: appointmentTypeSelect,
            });

            if (!types) {
                throw new Error("Error buscando tipos de citas");
            }

            if (types.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron tipos de citas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Tipos de citas encontrados éxitosamente",
                data: types,
            };
        } catch (error) {
            console.error("Error buscando tipos de citas:", error);

            return {
                status: 500,
                message: "Error interno al buscar los tipos de citas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const type = await prisma.appointmentType.findUnique({
                where: { id },
                select: appointmentTypeSelect,
            });

            if (!type) {
                throw new Error("Error buscando el tipo de cita");
            }

            return {
                status: 200,
                message: "Tipo de cita encontrado éxitosamente",
                data: type,
            };
        } catch (error) {
            console.error("Error buscando el tipo de cita:", error);

            return {
                status: 500,
                message: "Error interno al buscar el tipo de cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateAppointmentTypeDto) {
        try {
            const type = await prisma.appointmentType.update({
                where: { id },
                data,
                select: appointmentTypeSelect,
            });

            if (!type) {
                throw new Error("Error actualizando el tipo de cita");
            }

            return {
                status: 200,
                message: "Tipo de cita actualizado éxitosamente",
                data: type,
            };
        } catch (error) {
            console.error("Error actualizando el tipo de cita:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el tipo de cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const type = await prisma.appointmentType.delete({
                where: { id },
                select: appointmentTypeSelect,
            });

            if (!type) {
                throw new Error("Error eliminando el tipo de cita");
            }

            return {
                status: 200,
                message: "Tipo de cita eliminado éxitosamente",
                data: type,
            };
        } catch (error) {
            console.error("Error eliminando el tipo de cita:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el tipo de cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
