import { prisma } from "@/configs";
import { CreateDoctorAvailabilityDto, UpdateDoctorAvailabilityDto } from "./doctorAvailability.interface";

const doctorAvailabilitySelect = {
    id: true,
    doctorId: true,
    day_of_week: true,
    start_time: true,
    end_time: true,
    patient_limit: true,
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
} as const;

export class DoctorAvailabilityService {

    async create(data: CreateDoctorAvailabilityDto) {
        try {
            const availability = await prisma.doctorAvailability.create({
                data,
                select: doctorAvailabilitySelect,
            });

            if (!availability) {
                throw new Error("Error creando la disponibilidad");
            }

            return {
                status: 201,
                message: "Disponibilidad creada éxitosamente",
                data: availability,
            };
        } catch (error) {
            console.error("Error creando disponibilidad:", error);

            return {
                status: 500,
                message: "Error interno al crear la disponibilidad",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const availabilities = await prisma.doctorAvailability.findMany({
                orderBy: [{ doctorId: "asc" }, { day_of_week: "asc" }, { start_time: "asc" }],
                select: doctorAvailabilitySelect,
            });

            if (!availabilities) {
                throw new Error("Error buscando disponibilidades");
            }

            if (availabilities.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron disponibilidades",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Disponibilidades encontradas éxitosamente",
                data: availabilities,
            };
        } catch (error) {
            console.error("Error buscando disponibilidades:", error);

            return {
                status: 500,
                message: "Error interno al buscar disponibilidades",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const availability = await prisma.doctorAvailability.findUnique({
                where: { id },
                select: doctorAvailabilitySelect,
            });

            if (!availability) {
                throw new Error("Error buscando la disponibilidad");
            }

            return {
                status: 200,
                message: "Disponibilidad encontrada éxitosamente",
                data: availability,
            };
        } catch (error) {
            console.error("Error buscando la disponibilidad:", error);

            return {
                status: 500,
                message: "Error interno al buscar la disponibilidad",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateDoctorAvailabilityDto) {
        try {
            const availability = await prisma.doctorAvailability.update({
                where: { id },
                data,
                select: doctorAvailabilitySelect,
            });

            if (!availability) {
                throw new Error("Error actualizando la disponibilidad");
            }

            return {
                status: 200,
                message: "Disponibilidad actualizada éxitosamente",
                data: availability,
            };
        } catch (error) {
            console.error("Error actualizando disponibilidad:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la disponibilidad",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const availability = await prisma.doctorAvailability.delete({
                where: { id },
                select: doctorAvailabilitySelect,
            });

            if (!availability) {
                throw new Error("Error eliminando la disponibilidad");
            }

            return {
                status: 200,
                message: "Disponibilidad eliminada éxitosamente",
                data: availability,
            };
        } catch (error) {
            console.error("Error eliminando disponibilidad:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la disponibilidad",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
