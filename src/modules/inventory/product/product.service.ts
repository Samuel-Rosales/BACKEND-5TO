import { prisma } from "@/configs";
import { CreateProductDto, UpdateProductDto } from "./product.interface";

const productSelect = {
    id: true,
    name: true,
    sku: true,
    description: true,
    cost_price: true,
    min_stock: true,
    active: true,
    categoryId: true,
    unitId: true,
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    unit: {
        select: {
            id: true,
            name: true,
            symbol: true,
        },
    },
} as const;

export class ProductService {

    async create(data: CreateProductDto) {
        try {
            const product = await prisma.supply.create({
                data,
                select: productSelect,
            });

            if (!product) {
                throw new Error("Error creando el producto");
            }

            return {
                status: 201,
                message: "Producto creado éxitosamente",
                data: product,
            };
        } catch (error) {
            console.error("Error creando el producto:", error);

            return {
                status: 500,
                message: "Error interno al crear el producto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const products = await prisma.supply.findMany({
                where: { active: true },
                orderBy: { id: "desc" },
                select: productSelect,
            });

            if (!products) {
                throw new Error("Error buscando productos");
            }

            if (products.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron productos",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Productos encontrados éxitosamente",
                data: products,
            };
        } catch (error) {
            console.error("Error buscando productos:", error);

            return {
                status: 500,
                message: "Error interno al buscar los productos",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const product = await prisma.supply.findUnique({
                where: { id, active: true },
                select: productSelect,
            });

            if (!product) {
                throw new Error("Error buscando el producto");
            }

            return {
                status: 200,
                message: "Producto encontrado éxitosamente",
                data: product,
            };
        } catch (error) {
            console.error("Error buscando el producto:", error);

            return {
                status: 500,
                message: "Error interno al buscar el producto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateProductDto) {
        try {
            const product = await prisma.supply.update({
                where: { id, active: true },
                data,
                select: productSelect,
            });

            if (!product) {
                throw new Error("Error actualizando el producto");
            }

            return {
                status: 200,
                message: "Producto actualizado éxitosamente",
                data: product,
            };
        } catch (error) {
            console.error("Error actualizando el producto:", error);

            return {
                status: 500,
                message: "Error interno al actualizar el producto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const product = await prisma.supply.update({
                where: { id, active: true },
                data: { active: false },
                select: productSelect,
            });

            if (!product) {
                throw new Error("Error eliminando el producto");
            }

            return {
                status: 200,
                message: "Producto eliminado éxitosamente",
                data: product,
            };
        } catch (error) {
            console.error("Error eliminando el producto:", error);

            return {
                status: 500,
                message: "Error interno al eliminar el producto",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
