import { prisma } from "@/configs";
import { Prisma } from "@prisma/client";
import { CreateAppointmentDto, UpdateAppointmentDto } from "./appointment.interface";

const appointmentSelect = {
    id: true,
    doctorId: true,
    patientId: true,
    statusId: true,
    typeId: true,
    reson_visit: true,
    price: true,
    date_time: true,
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
            ci: true,
            name: true,
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

    private normalizeRange(value?: string) {
        if (!value) return undefined;
        const normalized = value.trim().toLowerCase();

        if (normalized === "today" || normalized === "hoy") return "today" as const;
        if (normalized === "week" || normalized === "semana") return "week" as const;
        if (normalized === "month" || normalized === "mes") return "month" as const;

        return undefined;
    }

    private rangeBoundsUTC(range: "today" | "week" | "month", now: Date) {
        const todayStart = this.dayStartUTC(now);

        if (range === "today") {
            const end = new Date(todayStart);
            end.setUTCDate(end.getUTCDate() + 1);
            return { start: todayStart, end };
        }

        if (range === "week") {
            const dow = todayStart.getUTCDay();
            const daysSinceMonday = (dow + 6) % 7;
            const start = new Date(todayStart);
            start.setUTCDate(start.getUTCDate() - daysSinceMonday);
            const end = new Date(start);
            end.setUTCDate(end.getUTCDate() + 7);
            return { start, end };
        }

        // month
        const start = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1, 0, 0, 0, 0));
        const end = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth() + 1, 1, 0, 0, 0, 0));
        return { start, end };
    }

    private dayStartUTC(dateTime: Date) {
        return new Date(Date.UTC(dateTime.getUTCFullYear(), dateTime.getUTCMonth(), dateTime.getUTCDate(), 0, 0, 0, 0));
    }

    private atDayTimeUTC(dayStart: Date, time: Date) {
        return new Date(
            Date.UTC(
                dayStart.getUTCFullYear(),
                dayStart.getUTCMonth(),
                dayStart.getUTCDate(),
                time.getUTCHours(),
                time.getUTCMinutes(),
                time.getUTCSeconds(),
                time.getUTCMilliseconds()
            )
        );
    }

    private normalizeDateTime(value: string | Date) {
        if (value instanceof Date) return value;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new Error("date_time inválida: se esperaba fecha ISO válida");
        }
        return parsed;
    }

    private timeMinutesUTC(date: Date) {
        return date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
    }

    private async getOverrideForDate(doctorId: number, dateTime: Date) {
        const dayStart = this.dayStartUTC(dateTime);
        const dayEnd = new Date(dayStart);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

        return prisma.doctorScheduleOverride.findFirst({
            where: {
                doctorId,
                specific_date: {
                    gte: dayStart,
                    lt: dayEnd,
                },
            },
            orderBy: { specific_date: "desc" },
            select: { is_working: true, start_time: true, end_time: true },
        });
    }

    private async doctorHasAvailability(params: { doctorId: number; dateTime: Date }) {
        const { doctorId, dateTime } = params;
        const dayOfWeek = dateTime.getUTCDay();
        const appointmentMin = this.timeMinutesUTC(dateTime);
        const dayStart = this.dayStartUTC(dateTime);

        const override = await this.getOverrideForDate(doctorId, dateTime);
        if (override && override.is_working === false) {
            return { ok: false as const, reason: "El doctor no trabaja en esa fecha" };
        }

        const schedule = await prisma.doctorSchedule.findFirst({
            where: {
                doctorId,
                period_start: { lte: dayStart },
                OR: [{ period_end: null }, { period_end: { gt: dayStart } }],
            },
            orderBy: { period_start: "desc" },
            select: { id: true },
        });

        if (!schedule) {
            return { ok: false as const, reason: "No hay un horario (DoctorSchedule) vigente para esa fecha" };
        }

        const availabilities = await prisma.doctorAvailability.findMany({
            where: {
                doctorScheduleId: schedule.id,
                day_of_week: dayOfWeek,
            },
            select: { start_time: true, end_time: true, patient_limit: true },
        });

        
        if (availabilities.length === 0) {
            return { ok: false as const, reason: "No hay horarios disponibles para ese día" };
        }

        const matchingAvailability = availabilities.find((a) => {
            const startMin = this.timeMinutesUTC(a.start_time);
            const endMin = this.timeMinutesUTC(a.end_time);
            return appointmentMin >= startMin && appointmentMin < endMin;
        });

        if (!matchingAvailability) {
            return { ok: false as const, reason: "La hora solicitada no está dentro del horario disponible" };
        }

        if (override?.start_time && override?.end_time) {
            const oStart = this.timeMinutesUTC(override.start_time);
            const oEnd = this.timeMinutesUTC(override.end_time);
            if (!(appointmentMin >= oStart && appointmentMin < oEnd)) {
                return { ok: false as const, reason: "La hora solicitada está fuera del horario de ese día" };
            }
        }

        let slotStart = this.atDayTimeUTC(dayStart, matchingAvailability.start_time);
        let slotEnd = this.atDayTimeUTC(dayStart, matchingAvailability.end_time);

        // Si existe override con rango, intersecta con la franja base.
        if (override?.start_time && override?.end_time) {
            const oStart = this.atDayTimeUTC(dayStart, override.start_time);
            const oEnd = this.atDayTimeUTC(dayStart, override.end_time);
            if (oStart > slotStart) slotStart = oStart;
            if (oEnd < slotEnd) slotEnd = oEnd;
        }

        const appointmentsCount = await prisma.appointment.count({
            where: {
                doctorId,
                date_time: {
                    gte: slotStart,
                    lt: slotEnd,
                },
                status: {
                    name: {
                        not: { equals: "Cancelada" },
                    },
                },
            },
        });

        if (appointmentsCount >= matchingAvailability.patient_limit) {
            return { ok: false as const, reason: "Ya se alcanzó el límite de pacientes para ese horario" };
        }

        return { ok: true as const };
    }

    async create(data: CreateAppointmentDto) {
        try {
            const dateTime = this.normalizeDateTime(data.date_time);

            let doctorId = data.doctorId;

            if (!doctorId) {
                if (!data.specialtyId) {
                    return {
                        status: 400,
                        message: "Debe enviar doctorId o specialtyId",
                        error: "Validación",
                    };
                }

                const doctors = await prisma.doctor.findMany({
                    where: {
                        specialtyId: data.specialtyId,
                        active: true,
                    },
                    orderBy: { id: "asc" },
                    select: { id: true },
                });
                let rason = "";
                for (const d of doctors) {
                    const availabilityCheck = await this.doctorHasAvailability({ doctorId: d.id, dateTime });

                    if (availabilityCheck.ok) {
                        doctorId = d.id;
                        break;
                    }

                    rason = availabilityCheck.reason || "";
                }

                if (!doctorId) {
                    return {
                        status: 400,
                        message: rason ? rason : "No hay disponibilidad en esa fecha para esa especialidad",
                        error: "Sin disponibilidad",
                    };
                }
            } else {
                const availabilityCheck = await this.doctorHasAvailability({ doctorId, dateTime });
                if (!availabilityCheck.ok) {
                    return {
                        status: 400,
                        message: availabilityCheck.reason,
                        error: "Sin disponibilidad",
                    };
                }
            }

            const existing = await prisma.appointment.findFirst({
                where: {
                    doctorId,
                    patientId: data.patientId,
                    date_time: dateTime,
                    status: {
                        name: {
                            not: { equals: "Cancelada" },
                        },
                    },
                },
                select: { id: true },
            });
            if (existing) {
                return {
                    status: 409,
                    message: "El paciente ya tiene una cita con ese doctor en esa horario",
                    error: "Conflicto",
                };
            }

            const appointment = await prisma.appointment.create({
                data: {
                    doctorId,
                    patientId: data.patientId,
                    statusId: data.statusId,
                    typeId: data.typeId,
                    reson_visit: data.reson_visit,
                    price: data.price,
                    date_time: dateTime,
                },
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

    async findAll(filters?: { range?: string, statusId?: number }) {
        try {
            const range = this.normalizeRange(filters?.range);
            if (filters?.range && !range) {
                return {
                    status: 400,
                    message: "Filtro inválido",
                    error: "range debe ser: hoy|semana|mes (o today|week|month)",
                };
            }

            const where: Prisma.AppointmentWhereInput = {};
            if (range) {
                const { start, end } = this.rangeBoundsUTC(range, new Date());
                where.date_time = { gte: start, lt: end };
            }
            if(filters?.statusId) where.statusId = filters.statusId;

            const appointments = await prisma.appointment.findMany({
                where,
                orderBy: { date_time: "desc" },
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

    async findManyByDr(doctorId: number) {
        try {
            const appointments = await prisma.appointment.findMany({
                where: { doctorId },
                orderBy: { date_time: "desc" },
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
            const appointment = await prisma.appointment.findUnique({
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
            const normalized: UpdateAppointmentDto = {
                ...data,
                date_time: data.date_time ? this.normalizeDateTime(data.date_time) : undefined,
            };

            const appointment = await prisma.appointment.update({
                where: { id },
                data: normalized,
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
            const appointment = await prisma.appointment.delete({
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
