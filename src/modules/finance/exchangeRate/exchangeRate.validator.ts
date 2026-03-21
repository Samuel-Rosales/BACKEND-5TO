import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class ExchangeRateValidator {

    public createExchangeRateValidator: ValidationChain[] = [
        body("rate")
            .isFloat({ gt: 0 })
            .withMessage("La tasa debe ser un número mayor a 0"),

        body("is_active")
            .optional()
            .isBoolean()
            .withMessage("is_active debe ser boolean"),
    ];

    public updateExchangeRateValidator: ValidationChain[] = [
        body("rate")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("La tasa debe ser un número mayor a 0"),

        body("is_active")
            .optional()
            .isBoolean()
            .withMessage("is_active debe ser boolean"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public ExchangeRateExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const rate = await prisma.exchangeRate.findUnique({ where: { id: Number(value) } });

                if (!rate) {
                    return Promise.reject("La tasa de cambio no existe");
                }
            }),
    ];
}
