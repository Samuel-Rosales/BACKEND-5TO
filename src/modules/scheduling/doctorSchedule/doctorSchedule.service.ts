import { prisma } from "@/configs";
import { Prisma } from "@prisma/client";
import { CreateDoctorScheduleDto, UpdateDoctorScheduleDto, DoctorSchedConfigDTO } from "./doctorSchedule.interface";

const doctorScheduleSelect: Prisma.DoctorScheduleSelect = {
    id: true,
    doctorId: true,
    period_start: true,
    period_end: true,
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
                    consultation_price: true
                },
            },
        },
    },
    availabilities: {
        select: {
            id: true,
            doctorScheduleId: true,
            day_of_week: true,
            start_time: true,
            end_time: true,
            patient_limit: true,
        },
        orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
    },
};
const doctorSelect: Prisma.DoctorScheduleSelect = {
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
                    consultation_price: true,
                },
            },
        },
    },
};

export class DoctorScheduleService {

    private normalizeDate(value: string | Date) {
        console.log("Normalizando fecha:", value);  
        if (value instanceof Date) return value;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new Error("Fecha inválida: se esperaba fecha ISO válida");
        }
        console.log("Fecha normalizada:", parsed);
        return parsed;
    }
    private parseDate(dateStr: string): Date {
        const [day, month, year] = dateStr.split('-').map(Number);
        // Crear fecha al inicio del día para comparaciones correctas
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    private isValidDateInDDMMYYYY(dateStr: string): boolean {
        // Valida formato dd-mm-aaaa con guiones
        const regex = /^(\d{2})\-(\d{2})\-(\d{4})$/;
        const match = dateStr.match(regex);
        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        // Validar rangos básicos
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;

        // Validar días por mes (considera años bisiestos)
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) return false;

        return true;
    }

    private transformToDoctorSchedConfigArray(schedules: any[]): DoctorSchedConfigDTO[] {
        return schedules.map(schedule => ({
            id: schedule.doctor.id,
            user: {
                id: schedule.doctor.user.id,
                ci: schedule.doctor.user.ci,
                name: schedule.doctor.user.name,
            },
            specialty: {
                id: schedule.doctor.specialty.id,
                name: schedule.doctor.specialty.name,
                consultation_price: schedule.doctor.specialty.consultation_price,
            },
        }));
    }

    async create(data: CreateDoctorScheduleDto) {
        try {
            const normalized: CreateDoctorScheduleDto = {
                ...data,
                period_start: this.normalizeDate(data.period_start),
                period_end: data.period_end === null || data.period_end === undefined ? data.period_end : this.normalizeDate(data.period_end),
            };

            const schedule = await prisma.doctorSchedule.create({
                data: normalized,
                select: doctorScheduleSelect,
            });

            if (!schedule) {
                throw new Error("Error creando el DoctorSchedule");
            }

            return {
                status: 201,
                message: "DoctorSchedule creado éxitosamente",
                data: schedule,
            };
        } catch (error) {
            console.error("Error creando DoctorSchedule:", error);

            return {
                status: 500,
                message: "Error interno al crear el DoctorSchedule",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll(filters?: { doctorId?: number, periodEnd?: string | null, range?: { rangeStart: string, rangeEnd: string } }, doctorOnly: boolean = false) {
        try {
            const where: Prisma.DoctorScheduleWhereInput = {};
            if (filters?.doctorId) where.doctorId = filters.doctorId;
            if (filters?.periodEnd !== undefined) {
                if (((typeof filters.periodEnd) == 'string' && this.isValidDateInDDMMYYYY(filters.periodEnd))
                    || filters.periodEnd == null) {
                    where.period_end = filters.periodEnd; // PARA OBTENER SOLO LOS QUE TIENEN PERIOD END NULL Y ASI OBTENER SOLO LOS HORARIOS VIGENTES
                }
            }
            if (filters?.range) {
                const { rangeStart, rangeEnd } = filters.range;
                const startDate = this.parseDate(rangeStart);
                const endDate = this.parseDate(rangeEnd);
                // Condición de solapamiento:
                where.OR = [
                    {
                        period_start: {
                            lte: endDate,
                        },
                        period_end: null
                    },
                    {
                        period_start: {
                            lte: endDate,  // Comienza antes o en el fin del rango
                        },
                        period_end: {
                            gte: startDate,  // Termina después o en el inicio del rango
                        }
                    }
                ];
            }

            const schedules = await prisma.doctorSchedule.findMany({
                where,
                orderBy: [{ doctorId: "asc" }, { period_start: "desc" }],
                select: doctorOnly ? doctorSelect : doctorScheduleSelect,
            });

            if (!schedules) {
                throw new Error("Error buscando DoctorSchedule");
            }

            if (schedules.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron DoctorSchedule",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "DoctorSchedule encontrados exitosamente",
                data: doctorOnly ? this.transformToDoctorSchedConfigArray(schedules) : schedules,
            };
        } catch (error) {
            console.error("Error buscando DoctorSchedule:", error);
            return {
                status: 500,
                message: "Error interno al buscar DoctorSchedule",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    /*async findAllByDoctor(doctorId: number) {
        try {
            const schedules = await prisma.doctorSchedule.findMany({
                where: { doctorId },
                orderBy: [{ period_start: "desc" }],
                select: doctorScheduleSelect,
            });

            if (!schedules) {
                return {
                    status: 404,
                    message: "No se encontraron DoctorSchedule para el doctor especificado",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "DoctorSchedule encontrados éxitosamente",
                data: schedules,
            };
        } catch (error) {
            console.error("Error buscando DoctorSchedule por doctorId:", error);

            return {
                status: 500,
                message: "Error interno al buscar DoctorSchedule",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }*/

    async findOne(id: number) {
        try {
            const schedule = await prisma.doctorSchedule.findUnique({
                where: { id },
                select: doctorScheduleSelect,
            });

            if (!schedule) {
                throw new Error("Error buscando el DoctorSchedule");
            }

            return {
                status: 200,
                message: "DoctorSchedule encontrado éxitosamente",
                data: schedule,
            };
        } catch (error) {
            console.error("Error buscando DoctorSchedule:", error);

            return {
                status: 500,
                message: "Error interno al buscar el DoctorSchedule",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateDoctorScheduleDto) {
        try {
            const normalized: UpdateDoctorScheduleDto = {
                ...data,
                period_start: data.period_start ? this.normalizeDate(data.period_start) : undefined,
                period_end: data.period_end === null || data.period_end === undefined ? data.period_end : this.normalizeDate(data.period_end),
            };

            const schedule = await prisma.doctorSchedule.update({
                where: { id },
                data: normalized,
                select: doctorScheduleSelect,
            });

            if (!schedule) {
                throw new Error("Error actualizando el DoctorSchedule");
            }

            return {
                status: 200,
                message: "DoctorSchedule actualizado éxitosamente",
                data: schedule,
            };
        } catch (error) {
            console.error("Error actualizando DoctorSchedule:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el DoctorSchedule",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const schedule = await prisma.doctorSchedule.delete({
                where: { id },
                select: doctorScheduleSelect,
            });

            if (!schedule) {
                throw new Error("Error eliminando el DoctorSchedule");
            }

            return {
                status: 200,
                message: "DoctorSchedule eliminado éxitosamente",
                data: schedule,
            };
        } catch (error) {
            console.error("Error eliminando DoctorSchedule:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el DoctorSchedule",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
