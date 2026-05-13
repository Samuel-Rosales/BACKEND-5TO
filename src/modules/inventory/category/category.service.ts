import { prisma } from "@/configs";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.interface";

const categorySelect = {
    id: true,
    name: true,
} as const;

export class CategoryService {

    async create(data: CreateCategoryDto) {
        try {
            const category = await prisma.category.create({
                data,
                select: categorySelect,
            });

            if (!category) {
                throw new Error("Error creando la categoría");
            }

            return {
                status: 201,
                message: "Categoría creada éxitosamente",
                data: category,
            };
        } catch (error) {
            console.error("Error creando la categoría:", error);

            return {
                status: 500,
                message: "Error interno al crear la categoría",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const categories = await prisma.category.findMany({
                orderBy: { id: "asc" },
                select: categorySelect,
            });

            if (!categories) {
                throw new Error("Error buscando categorías");
            }

            if (categories.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron categorías",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Categorías encontradas éxitosamente",
                data: categories,
            };
        } catch (error) {
            console.error("Error buscando categorías:", error);

            return {
                status: 500,
                message: "Error interno al buscar las categorías",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const category = await prisma.category.findUnique({
                where: { id },
                select: categorySelect,
            });

            if (!category) {
                throw new Error("Error buscando la categoría");
            }

            return {
                status: 200,
                message: "Categoría encontrada éxitosamente",
                data: category,
            };
        } catch (error) {
            console.error("Error buscando la categoría:", error);

            return {
                status: 500,
                message: "Error interno al buscar la categoría",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateCategoryDto) {
        try {
            const category = await prisma.category.update({
                where: { id },
                data,
                select: categorySelect,
            });

            if (!category) {
                throw new Error("Error actualizando la categoría");
            }

            return {
                status: 200,
                message: "Categoría actualizada éxitosamente",
                data: category,
            };
        } catch (error) {
            console.error("Error actualizando la categoría:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la categoría",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const category = await prisma.category.delete({
                where: { id },
                select: categorySelect,
            });

            if (!category) {
                throw new Error("Error eliminando la categoría");
            }

            return {
                status: 200,
                message: "Categoría eliminada éxitosamente",
                data: category,
            };
        } catch (error) {
            console.error("Error eliminando la categoría:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la categoría",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
