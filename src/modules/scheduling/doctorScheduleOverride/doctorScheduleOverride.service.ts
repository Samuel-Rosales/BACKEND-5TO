import { prisma } from "@/configs";
import { CreateDoctorScheduleOverrideDto, UpdateDoctorScheduleOverrideDto } from "./doctorScheduleOverride.interface";

const doctorScheduleOverrideSelect = {
    id: true,
    doctorId: true,
    specific_date: true,
    is_working: true,
    start_time: true,
    end_time: true,
    reason: true,
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

export class DoctorScheduleOverrideService {

    async create(data: CreateDoctorScheduleOverrideDto) {
        try {
            const override = await prisma.doctorScheduleOverride.create({
                data,
                select: doctorScheduleOverrideSelect,
            });

            if (!override) {
                throw new Error("Error creando el override");
            }

            return {
                status: 201,
                message: "Override creado éxitosamente",
                data: override,
            };
        } catch (error) {
            console.error("Error creando override:", error);

            return {
                status: 500,
                message: "Error interno al crear el override",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const overrides = await prisma.doctorScheduleOverride.findMany({
                orderBy: [{ doctorId: "asc" }, { specific_date: "desc" }],
                select: doctorScheduleOverrideSelect,
            });

            if (!overrides) {
                throw new Error("Error buscando overrides");
            }

            if (overrides.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron overrides",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Overrides encontrados éxitosamente",
                data: overrides,
            };
        } catch (error) {
            console.error("Error buscando overrides:", error);

            return {
                status: 500,
                message: "Error interno al buscar overrides",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const override = await prisma.doctorScheduleOverride.findUnique({
                where: { id },
                select: doctorScheduleOverrideSelect,
            });

            if (!override) {
                throw new Error("Error buscando el override");
            }

            return {
                status: 200,
                message: "Override encontrado éxitosamente",
                data: override,
            };
        } catch (error) {
            console.error("Error buscando el override:", error);

            return {
                status: 500,
                message: "Error interno al buscar el override",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateDoctorScheduleOverrideDto) {
        try {
            const override = await prisma.doctorScheduleOverride.update({
                where: { id },
                data,
                select: doctorScheduleOverrideSelect,
            });

            if (!override) {
                throw new Error("Error actualizando el override");
            }

            return {
                status: 200,
                message: "Override actualizado éxitosamente",
                data: override,
            };
        } catch (error) {
            console.error("Error actualizando override:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el override",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const override = await prisma.doctorScheduleOverride.delete({
                where: { id },
                select: doctorScheduleOverrideSelect,
            });

            if (!override) {
                throw new Error("Error eliminando el override");
            }

            return {
                status: 200,
                message: "Override eliminado éxitosamente",
                data: override,
            };
        } catch (error) {
            console.error("Error eliminando override:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el override",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
