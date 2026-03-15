import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class MeasurementUnitValidator {

    public createMeasurementUnitValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

        body("symbol")
            .trim()
            .isLength({ min: 1, max: 20 })
            .withMessage("El símbolo debe tener entre 1 y 20 caracteres"),
    ];

    public updateMeasurementUnitValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

        body("symbol")
            .optional()
            .trim()
            .isLength({ min: 1, max: 20 })
            .withMessage("El símbolo debe tener entre 1 y 20 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID de la unidad de medida debe ser un número entero positivo"),
    ];

    public MeasurementUnitExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const unit = await prisma.measurementUnit.findUnique({ where: { id: Number(value) } });

                if (!unit) {
                    return Promise.reject("La unidad de medida no existe");
                }
            }),
    ];
}
