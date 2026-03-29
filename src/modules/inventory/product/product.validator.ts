import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class ProductValidator {

    public createProductValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 150 })
            .withMessage("El nombre debe tener entre 2 y 150 caracteres"),

        body("sku")
            .optional()
            .trim()
            .isLength({ min: 1, max: 60 })
            .withMessage("El SKU debe tener entre 1 y 60 caracteres"),

        body("description")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("La descripción debe tener entre 1 y 5000 caracteres"),

        body("cost_price")
            .isFloat({ gt: 0 })
            .withMessage("El costo debe ser un número mayor a 0"),

        body("min_stock")
            .optional()
            .isInt({ min: 0 })
            .withMessage("El stock mínimo debe ser un entero mayor o igual a 0"),

        body("active")
            .optional()
            .isBoolean()
            .withMessage("active debe ser boolean"),

        body("categoryId")
            .isInt({ gt: 0 })
            .withMessage("El categoryId debe ser un número entero positivo")
            .custom(async (value) => {
                const category = await prisma.category.findUnique({ where: { id: Number(value) } });

                if (!category) {
                    return Promise.reject("La categoría no existe");
                }
            }),

        body("unitId")
            .isInt({ gt: 0 })
            .withMessage("El unitId debe ser un número entero positivo")
            .custom(async (value) => {
                const unit = await prisma.measurementUnit.findUnique({ where: { id: Number(value) } });

                if (!unit) {
                    return Promise.reject("La unidad de medida no existe");
                }
            }),
    ];

    public updateProductValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 150 })
            .withMessage("El nombre debe tener entre 2 y 150 caracteres"),

        body("sku")
            .optional()
            .trim()
            .isLength({ min: 1, max: 60 })
            .withMessage("El SKU debe tener entre 1 y 60 caracteres"),

        body("description")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("La descripción debe tener entre 1 y 5000 caracteres"),

        body("cost_price")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("El costo debe ser un número mayor a 0"),

        body("min_stock")
            .optional()
            .isInt({ min: 0 })
            .withMessage("El stock mínimo debe ser un entero mayor o igual a 0"),

        body("active")
            .optional()
            .isBoolean()
            .withMessage("active debe ser boolean"),

        body("categoryId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El categoryId debe ser un número entero positivo")
            .custom(async (value) => {
                const category = await prisma.category.findUnique({ where: { id: Number(value) } });

                if (!category) {
                    return Promise.reject("La categoría no existe");
                }
            }),

        body("unitId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El unitId debe ser un número entero positivo")
            .custom(async (value) => {
                const unit = await prisma.measurementUnit.findUnique({ where: { id: Number(value) } });

                if (!unit) {
                    return Promise.reject("La unidad de medida no existe");
                }
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del producto debe ser un número entero positivo"),
    ];

    public ProductExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const product = await prisma.supply.findUnique({ where: { id: Number(value) } });

                if (!product || !product.active) {
                    return Promise.reject("El producto no existe o no está activo");
                }
            }),
    ];
}
