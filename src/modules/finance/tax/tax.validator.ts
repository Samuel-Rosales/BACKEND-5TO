import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class TaxValidator {

    public createTaxValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

        body("rate")
            .isFloat({ gt: 0, lt: 100 })
            .withMessage("La tasa debe ser un número mayor a 0 y menor a 100"),

        body("code")
            .optional()
            .trim()
            .isLength({ min: 1, max: 60 })
            .withMessage("El código debe tener entre 1 y 60 caracteres"),

        body("isActive")
            .optional()
            .isBoolean()
            .withMessage("isActive debe ser boolean"),
    ];

    public updateTaxValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

        body("rate")
            .optional()
            .isFloat({ gt: 0, lt: 100 })
            .withMessage("La tasa debe ser un número mayor a 0 y menor a 100"),

        body("code")
            .optional()
            .trim()
            .isLength({ min: 1, max: 60 })
            .withMessage("El código debe tener entre 1 y 60 caracteres"),

        body("isActive")
            .optional()
            .isBoolean()
            .withMessage("isActive debe ser boolean"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public TaxExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const tax = await prisma.tax.findUnique({ where: { id: Number(value) } });

                if (!tax) {
                    return Promise.reject("El impuesto no existe");
                }
            }),
    ];
}
