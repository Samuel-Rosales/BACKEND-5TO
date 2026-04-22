import { prisma } from "@/configs";
import { Prisma } from "@prisma/client";
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

    private normalizeTime(value: string | Date) {
        if (value instanceof Date) return value;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new Error("Hora inválida: se esperaba fecha ISO válida");
        }
        return parsed;
    }

    private isMorning(start: Date) {
        // Para @db.Time, Prisma devuelve Date; usamos UTC para evitar desfases por zona horaria
        const hour = start.getUTCHours();
        return hour < 12;
    }

    private parseDateOnly(value: string) {
        // Espera YYYY-MM-DD
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new Error("date inválida: se esperaba formato YYYY-MM-DD");
        }
        return parsed;
    }

    async create(data: CreateDoctorAvailabilityDto) {
        try {
            const normalized: CreateDoctorAvailabilityDto = {
                ...data,
                start_time: this.normalizeTime(data.start_time),
                end_time: this.normalizeTime(data.end_time),
            };

            const availability = await prisma.doctorAvailability.create({
                data: normalized,
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

    async findAll(filters?: {
        doctorId?: number;
        specialtyId?: number;
        morning?: boolean;
        day_of_week?: number;
        date?: string;
    }) {
        try {
            const where: Prisma.DoctorAvailabilityWhereInput = {};

            if (filters?.doctorId) where.doctorId = filters.doctorId;

            if (filters?.date) {
                const dateOnly = this.parseDateOnly(filters.date);
                where.day_of_week = dateOnly.getUTCDay();
            } else if (typeof filters?.day_of_week === "number") {
                where.day_of_week = filters.day_of_week;
            }

            if (filters?.specialtyId) {
                where.doctor = { specialtyId: filters.specialtyId };
            }

            // Overrides solo aplica cuando estamos consultando un doctor específico + fecha
            if (filters?.doctorId && filters?.date) {
                const dayStart = new Date(`${filters.date}T00:00:00.000Z`);
                const dayEnd = new Date(dayStart);
                dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

                const override = await prisma.doctorScheduleOverride.findFirst({
                    where: {
                        doctorId: filters.doctorId,
                        specific_date: {
                            gte: dayStart,
                            lt: dayEnd,
                        },
                    },
                    orderBy: { specific_date: "desc" },
                    select: { is_working: true, start_time: true, end_time: true },
                });

                if (override && override.is_working === false) {
                    return {
                        status: 200,
                        message: "No se encontraron disponibilidades",
                        data: [],
                    };
                }

                const availabilities = await prisma.doctorAvailability.findMany({
                    where,
                    orderBy: [{ doctorId: "asc" }, { day_of_week: "asc" }, { start_time: "asc" }],
                    select: doctorAvailabilitySelect,
                });

                const morningFiltered = filters?.morning
                    ? availabilities.filter((a) => this.isMorning(a.start_time))
                    : availabilities;

                const timeWindowFiltered = override?.start_time && override?.end_time
                    ? morningFiltered.filter((a) => a.start_time >= override.start_time! && a.end_time <= override.end_time!)
                    : morningFiltered;

                if (timeWindowFiltered.length === 0) {
                    return {
                        status: 200,
                        message: "No se encontraron disponibilidades",
                        data: [],
                    };
                }

                return {
                    status: 200,
                    message: "Disponibilidades encontradas éxitosamente",
                    data: timeWindowFiltered,
                };
            }

            const availabilities = await prisma.doctorAvailability.findMany({
                where,
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

            const filtered = filters?.morning
                ? availabilities.filter((a) => this.isMorning(a.start_time))
                : availabilities;

            if (filtered.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron disponibilidades",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Disponibilidades encontradas éxitosamente",
                data: filtered,
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

    async findOne(doctorId: number) {
        try {
            const availability = await prisma.doctorAvailability.findMany({
                where: { doctorId },
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
            const normalized: UpdateDoctorAvailabilityDto = {
                ...data,
                start_time: data.start_time ? this.normalizeTime(data.start_time) : undefined,
                end_time: data.end_time ? this.normalizeTime(data.end_time) : undefined,
            };

            const availability = await prisma.doctorAvailability.update({
                where: { id },
                data: normalized,
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
