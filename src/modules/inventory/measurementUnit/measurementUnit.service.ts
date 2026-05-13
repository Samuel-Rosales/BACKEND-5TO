import { prisma } from "@/configs";
import { CreateMeasurementUnitDto, UpdateMeasurementUnitDto } from "./measurementUnit.interface";

const measurementUnitSelect = {
    id: true,
    name: true,
    symbol: true,
} as const;

export class MeasurementUnitService {

    async create(data: CreateMeasurementUnitDto) {
        try {
            const unit = await prisma.measurementUnit.create({
                data,
                select: measurementUnitSelect,
            });

            if (!unit) {
                throw new Error("Error creando la unidad de medida");
            }

            return {
                status: 201,
                message: "Unidad de medida creada éxitosamente",
                data: unit,
            };
        } catch (error) {
            console.error("Error creando la unidad de medida:", error);

            return {
                status: 500,
                message: "Error interno al crear la unidad de medida",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const units = await prisma.measurementUnit.findMany({
                orderBy: { id: "asc" },
                select: measurementUnitSelect,
            });

            if (!units) {
                throw new Error("Error buscando unidades de medida");
            }

            if (units.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron unidades de medida",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Unidades de medida encontradas éxitosamente",
                data: units,
            };
        } catch (error) {
            console.error("Error buscando unidades de medida:", error);

            return {
                status: 500,
                message: "Error interno al buscar las unidades de medida",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const unit = await prisma.measurementUnit.findUnique({
                where: { id },
                select: measurementUnitSelect,
            });

            if (!unit) {
                throw new Error("Error buscando la unidad de medida");
            }

            return {
                status: 200,
                message: "Unidad de medida encontrada éxitosamente",
                data: unit,
            };
        } catch (error) {
            console.error("Error buscando la unidad de medida:", error);

            return {
                status: 500,
                message: "Error interno al buscar la unidad de medida",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateMeasurementUnitDto) {
        try {
            const unit = await prisma.measurementUnit.update({
                where: { id },
                data,
                select: measurementUnitSelect,
            });

            if (!unit) {
                throw new Error("Error actualizando la unidad de medida");
            }

            return {
                status: 200,
                message: "Unidad de medida actualizada éxitosamente",
                data: unit,
            };
        } catch (error) {
            console.error("Error actualizando la unidad de medida:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la unidad de medida",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const unit = await prisma.measurementUnit.delete({
                where: { id },
                select: measurementUnitSelect,
            });

            if (!unit) {
                throw new Error("Error eliminando la unidad de medida");
            }

            return {
                status: 200,
                message: "Unidad de medida eliminada éxitosamente",
                data: unit,
            };
        } catch (error) {
            console.error("Error eliminando la unidad de medida:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la unidad de medida",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
