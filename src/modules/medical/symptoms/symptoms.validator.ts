import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class SymptomsValidator {
    public createSymptomValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 200 })
            .withMessage("El nombre debe tener entre 2 y 200 caracteres"),
    ];

    public updateSymptomValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 200 })
            .withMessage("El nombre debe tener entre 2 y 200 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del síntoma debe ser un número entero positivo"),
    ];

    public SymptomExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const symptom = await prisma.symptoms.findUnique({ where: { id: Number(value) } });

                if (!symptom) {
                    return Promise.reject("El síntoma no existe");
                }
            }),
    ];
}
