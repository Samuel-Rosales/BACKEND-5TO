import { prisma } from "@/configs";
import { CreateMedicalSpecialtyDto, UpdateMedicalSpecialtyDto } from "./medicalSpecialty.interface";

const medicalSpecialtySelect = {
    id: true,
    name: true,
    consultation_price: true,
    commission_percentage: true,
} as const;

export class MedicalSpecialtyService {

    async create(data: CreateMedicalSpecialtyDto) {
        try {
            const specialty = await prisma.medicalSpecialty.create({
                data,
                select: medicalSpecialtySelect,
            });

            if (!specialty) {
                throw new Error("Error creando la especialidad médica");
            }

            return {
                status: 201,
                message: "Especialidad médica creada éxitosamente",
                data: specialty,
            };
        } catch (error) {
            console.error("Error creando la especialidad médica:", error);

            return {
                status: 500,
                message: "Error interno al crear la especialidad médica",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const specialties = await prisma.medicalSpecialty.findMany({
                orderBy: { name: "asc" },
                select: medicalSpecialtySelect,
            });

            if (!specialties) {
                throw new Error("Error buscando especialidades médicas");
            }

            if (specialties.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron especialidades médicas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Especialidades médicas encontradas éxitosamente",
                data: specialties,
            };
        } catch (error) {
            console.error("Error buscando especialidades médicas:", error);

            return {
                status: 500,
                message: "Error interno al buscar las especialidades médicas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const specialty = await prisma.medicalSpecialty.findUnique({
                where: { id },
                select: medicalSpecialtySelect,
            });

            if (!specialty) {
                throw new Error("Error buscando la especialidad médica");
            }

            return {
                status: 200,
                message: "Especialidad médica encontrada éxitosamente",
                data: specialty,
            };
        } catch (error) {
            console.error("Error buscando la especialidad médica:", error);

            return {
                status: 500,
                message: "Error interno al buscar la especialidad médica",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateMedicalSpecialtyDto) {
        try {
            const specialty = await prisma.medicalSpecialty.update({
                where: { id },
                data,
                select: medicalSpecialtySelect,
            });

            if (!specialty) {
                throw new Error("Error actualizando la especialidad médica");
            }

            return {
                status: 200,
                message: "Especialidad médica actualizada éxitosamente",
                data: specialty,
            };
        } catch (error) {
            console.error("Error actualizando la especialidad médica:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la especialidad médica",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const specialty = await prisma.medicalSpecialty.delete({
                where: { id },
                select: medicalSpecialtySelect,
            });

            if (!specialty) {
                throw new Error("Error eliminando la especialidad médica");
            }

            return {
                status: 200,
                message: "Especialidad médica eliminada éxitosamente",
                data: specialty,
            };
        } catch (error) {
            console.error("Error eliminando la especialidad médica:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la especialidad médica",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
