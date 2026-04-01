import { prisma } from "@/configs";
import { CreateDoctorDto, UpdateDoctorDto } from "./doctor.interface";

const doctorSelect = {
    id: true,
    userId: true,
    specialtyId: true,
    user: {
        select: {
            id: true,
            ci: true,
            name: true,
            roleId: true,
            active: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    },
    specialty: {
        select: {
            id: true,
            name: true,
            consultation_price: true,
            commission_percentage: true,
        },
    },
} as const;

export class DoctorService {

    async create(data: CreateDoctorDto) {
        try {

            const user = await prisma.user.findUnique({
                where: { id: data.userId },
                include: { role: true },
            });

            if (user?.role.code !== "DOCTOR") {
                return {
                    status: 400,
                    message: "El usuario debe tener el rol de doctor",
                };
            }

            const doctor = await prisma.doctor.create({
                data,
                select: doctorSelect,
            });

            if (!doctor) {
                throw new Error("Error creando el doctor");
            }

            return {
                status: 201,
                message: "Doctor creado éxitosamente",
                data: doctor,
            };
        } catch (error) {
            console.error("Error creando el doctor:", error);

            return {
                status: 500,
                message: "Error interno al crear el doctor",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const doctors = await prisma.doctor.findMany({
                orderBy: { id: "desc" },
                select: doctorSelect,
            });

            if (!doctors) {
                throw new Error("Error buscando doctores");
            }

            if (doctors.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron doctores",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Doctores encontrados éxitosamente",
                data: doctors,
            };
        } catch (error) {
            console.error("Error buscando doctores:", error);

            return {
                status: 500,
                message: "Error interno al buscar los doctores",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const doctor = await prisma.doctor.findUnique({
                where: { id },
                select: doctorSelect,
            });

            if (!doctor) {
                throw new Error("Error buscando el doctor");
            }

            return {
                status: 200,
                message: "Doctor encontrado éxitosamente",
                data: doctor,
            };
        } catch (error) {
            console.error("Error buscando el doctor:", error);

            return {
                status: 500,
                message: "Error interno al buscar el doctor",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateDoctorDto) {
        try {
            const doctor = await prisma.doctor.update({
                where: { id },
                data,
                select: doctorSelect,
            });

            if (!doctor) {
                throw new Error("Error actualizando el doctor");
            }

            return {
                status: 200,
                message: "Doctor actualizado éxitosamente",
                data: doctor,
            };
        } catch (error) {
            console.error("Error actualizando el doctor:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el doctor",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const doctor = await prisma.doctor.delete({
                where: { id },
                select: doctorSelect,
            });

            if (!doctor) {
                throw new Error("Error eliminando el doctor");
            }

            return {
                status: 200,
                message: "Doctor eliminado éxitosamente",
                data: doctor,
            };
        } catch (error) {
            console.error("Error eliminando el doctor:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el doctor",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
