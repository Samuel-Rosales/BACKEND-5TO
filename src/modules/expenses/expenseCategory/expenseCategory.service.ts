import { prisma } from "@/configs";
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from "./expenseCategory.interface";

const expenseCategorySelect = {
    id: true,
    name: true,
} as const;

export class ExpenseCategoryService {

    async create(data: CreateExpenseCategoryDto) {
        try {
            const category = await prisma.expenseCategory.create({
                data,
                select: expenseCategorySelect,
            });

            if (!category) {
                throw new Error("Error creando la categoría de gasto");
            }

            return {
                status: 201,
                message: "Categoría de gasto creada éxitosamente",
                data: category,
            };
        } catch (error) {
            console.error("Error creando la categoría de gasto:", error);

            return {
                status: 500,
                message: "Error interno al crear la categoría de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const categories = await prisma.expenseCategory.findMany({
                orderBy: { id: "asc" },
                select: expenseCategorySelect,
            });

            if (!categories) {
                throw new Error("Error buscando categorías de gasto");
            }

            if (categories.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron categorías de gasto",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Categorías de gasto encontradas éxitosamente",
                data: categories,
            };
        } catch (error) {
            console.error("Error buscando categorías de gasto:", error);

            return {
                status: 500,
                message: "Error interno al buscar las categorías de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const category = await prisma.expenseCategory.findUnique({
                where: { id },
                select: expenseCategorySelect,
            });

            if (!category) {
                throw new Error("Error buscando la categoría de gasto");
            }

            return {
                status: 200,
                message: "Categoría de gasto encontrada éxitosamente",
                data: category,
            };
        } catch (error) {
            console.error("Error buscando la categoría de gasto:", error);

            return {
                status: 500,
                message: "Error interno al buscar la categoría de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateExpenseCategoryDto) {
        try {
            const category = await prisma.expenseCategory.update({
                where: { id },
                data,
                select: expenseCategorySelect,
            });

            if (!category) {
                throw new Error("Error actualizando la categoría de gasto");
            }

            return {
                status: 200,
                message: "Categoría de gasto actualizada éxitosamente",
                data: category,
            };
        } catch (error) {
            console.error("Error actualizando la categoría de gasto:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la categoría de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const category = await prisma.expenseCategory.delete({
                where: { id },
                select: expenseCategorySelect,
            });

            if (!category) {
                throw new Error("Error eliminando la categoría de gasto");
            }

            return {
                status: 200,
                message: "Categoría de gasto eliminada éxitosamente",
                data: category,
            };
        } catch (error) {
            console.error("Error eliminando la categoría de gasto:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la categoría de gasto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
