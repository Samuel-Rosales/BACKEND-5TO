import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class SupplyPresentationValidator {

    public createSupplyPresentationValidator: ValidationChain[] = [
        body("supplyId")
            .isInt({ gt: 0 })
            .withMessage("El supplyId debe ser un número entero positivo")
            .custom(async (value) => {
                const supply = await prisma.supply.findUnique({ where: { id: Number(value) } });
                if (!supply || !supply.active) {
                    return Promise.reject("El insumo no existe o no está activo");
                }
            }),

        body("name")
            .trim()
            .isLength({ min: 2, max: 150 })
            .withMessage("El nombre debe tener entre 2 y 150 caracteres"),

        body("factor")
            .isFloat({ gt: 0 })
            .withMessage("factor debe ser un número mayor a 0"),

        body("barCode")
            .optional()
            .trim()
            .isLength({ min: 1, max: 120 })
            .withMessage("barCode debe tener entre 1 y 120 caracteres"),

        body("price")
            .isFloat({ gt: 0 })
            .withMessage("price debe ser un número mayor a 0"),

        body("isActive")
            .optional()
            .isBoolean()
            .withMessage("isActive debe ser boolean"),
    ];

    public updateSupplyPresentationValidator: ValidationChain[] = [
        body("supplyId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El supplyId debe ser un número entero positivo")
            .custom(async (value) => {
                const supply = await prisma.supply.findUnique({ where: { id: Number(value) } });
                if (!supply || !supply.active) {
                    return Promise.reject("El insumo no existe o no está activo");
                }
            }),

        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 150 })
            .withMessage("El nombre debe tener entre 2 y 150 caracteres"),

        body("factor")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("factor debe ser un número mayor a 0"),

        body("barCode")
            .optional()
            .trim()
            .isLength({ min: 1, max: 120 })
            .withMessage("barCode debe tener entre 1 y 120 caracteres"),

        body("price")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("price debe ser un número mayor a 0"),

        body("isActive")
            .optional()
            .isBoolean()
            .withMessage("isActive debe ser boolean"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID de la presentación debe ser un número entero positivo"),
    ];

    public SupplyPresentationExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const presentation = await prisma.supplyPresentation.findUnique({ where: { id: Number(value) } });
                if (!presentation) {
                    return Promise.reject("La presentación no existe");
                }
            }),
    ];
}
