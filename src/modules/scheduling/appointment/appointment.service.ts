import { prisma } from "@/configs";
import { CreateAppointmentDto, UpdateAppointmentDto } from "./appointment.interface";

const appointmentSelect = {
    id: true,
    doctorId: true,
    patientId: true,
    statusId: true,
    typeId: true,
    reson_visit: true,
    price: true,
    start_datetime: true,
    end_datetime: true,
    doctor: {
        select: {
            id: true,
            userId: true,
            specialtyId: true,
            active: true,
            user: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                },
            },
            specialty: {
                select: {
                    id: true,
                    name: true,
                    active: true,
                },
            },
        },
    },
    patient: {
        select: {
            id: true,
            userId: true,
            active: true,
            user: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                },
            },
        },
    },
    status: {
        select: {
            id: true,
            name: true,
            color_hex: true,
        },
    },
    type: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

export class AppointmentService {

    async create(data: CreateAppointmentDto) {
        try {
            const appointment = await prisma.appoinment.create({
                data,
                select: appointmentSelect,
            });

            if (!appointment) {
                throw new Error("Error creando la cita");
            }

            return {
                status: 201,
                message: "Cita creada éxitosamente",
                data: appointment,
            };
        } catch (error) {
            console.error("Error creando la cita:", error);

            return {
                status: 500,
                message: "Error interno al crear la cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const appointments = await prisma.appoinment.findMany({
                orderBy: { start_datetime: "desc" },
                select: appointmentSelect,
            });

            if (!appointments) {
                throw new Error("Error buscando citas");
            }

            if (appointments.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron citas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Citas encontradas éxitosamente",
                data: appointments,
            };
        } catch (error) {
            console.error("Error buscando citas:", error);

            return {
                status: 500,
                message: "Error interno al buscar las citas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const appointment = await prisma.appoinment.findUnique({
                where: { id },
                select: appointmentSelect,
            });

            if (!appointment) {
                throw new Error("Error buscando la cita");
            }

            return {
                status: 200,
                message: "Cita encontrada éxitosamente",
                data: appointment,
            };
        } catch (error) {
            console.error("Error buscando la cita:", error);

            return {
                status: 500,
                message: "Error interno al buscar la cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateAppointmentDto) {
        try {
            const appointment = await prisma.appoinment.update({
                where: { id },
                data,
                select: appointmentSelect,
            });

            if (!appointment) {
                throw new Error("Error actualizando la cita");
            }

            return {
                status: 200,
                message: "Cita actualizada éxitosamente",
                data: appointment,
            };
        } catch (error) {
            console.error("Error actualizando la cita:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const appointment = await prisma.appoinment.delete({
                where: { id },
                select: appointmentSelect,
            });

            if (!appointment) {
                throw new Error("Error eliminando la cita");
            }

            return {
                status: 200,
                message: "Cita eliminada éxitosamente",
                data: appointment,
            };
        } catch (error) {
            console.error("Error eliminando la cita:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la cita",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
