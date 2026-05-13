import { prisma } from "@/configs";
import { CreateStatusAppointmentDto, UpdateStatusAppointmentDto } from "./statusAppointment.interface";

const statusAppointmentSelect = {
    id: true,
    name: true,
    color_hex: true,
} as const;

export class StatusAppointmentService {

    async create(data: CreateStatusAppointmentDto) {
        try {
            const statusAppointment = await prisma.statusAppointment.create({
                data,
                select: statusAppointmentSelect,
            });

            if (!statusAppointment) {
                throw new Error("Error creando el estatus de cita");
            }

            return {
                status: 201,
                message: "Estatus de cita creado éxitosamente",
                data: statusAppointment,
            };
        } catch (error) {
            console.error("Error creando el estatus de cita:", error);

            return {
                status: 500,
                message: "Error interno al crear el estatus de cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const statuses = await prisma.statusAppointment.findMany({
                orderBy: { id: "asc" },
                select: statusAppointmentSelect,
            });

            if (!statuses) {
                throw new Error("Error buscando estatus de citas");
            }

            if (statuses.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron estatus de citas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Estatus de citas encontrados éxitosamente",
                data: statuses,
            };
        } catch (error) {
            console.error("Error buscando estatus de citas:", error);

            return {
                status: 500,
                message: "Error interno al buscar los estatus de citas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const statusAppointment = await prisma.statusAppointment.findUnique({
                where: { id },
                select: statusAppointmentSelect,
            });

            if (!statusAppointment) {
                throw new Error("Error buscando el estatus de cita");
            }

            return {
                status: 200,
                message: "Estatus de cita encontrado éxitosamente",
                data: statusAppointment,
            };
        } catch (error) {
            console.error("Error buscando el estatus de cita:", error);

            return {
                status: 500,
                message: "Error interno al buscar el estatus de cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateStatusAppointmentDto) {
        try {
            const statusAppointment = await prisma.statusAppointment.update({
                where: { id },
                data,
                select: statusAppointmentSelect,
            });

            if (!statusAppointment) {
                throw new Error("Error actualizando el estatus de cita");
            }

            return {
                status: 200,
                message: "Estatus de cita actualizado éxitosamente",
                data: statusAppointment,
            };
        } catch (error) {
            console.error("Error actualizando el estatus de cita:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el estatus de cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const statusAppointment = await prisma.statusAppointment.delete({
                where: { id },
                select: statusAppointmentSelect,
            });

            if (!statusAppointment) {
                throw new Error("Error eliminando el estatus de cita");
            }

            return {
                status: 200,
                message: "Estatus de cita eliminado éxitosamente",
                data: statusAppointment,
            };
        } catch (error) {
            console.error("Error eliminando el estatus de cita:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el estatus de cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
