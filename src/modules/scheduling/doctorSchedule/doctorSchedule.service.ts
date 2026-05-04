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
        if (value instanceof Date) return value;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new Error("Fecha inválida: se esperaba fecha ISO válida");
        }
        return parsed;
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

    async findAll(filters?: { doctorId?: number, periodEnd?: string | null}, doctorOnly: boolean = false) {
        try {
            const where: Prisma.DoctorScheduleWhereInput = {};
            if (filters?.doctorId) where.doctorId = filters.doctorId;
            if(filters?.periodEnd !== undefined) where.period_end = filters.periodEnd; // PARA OBTENER SOLO LOS QUE TIENEN PERIOD END NULL Y ASI OBTENER SOLO LOS HORARIOS VIGENTES

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
                message: "DoctorSchedule encontrados éxitosamente",
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
