import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class MedicalSpecialtyValidator {

    public createMedicalSpecialtyValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

        body("consultation_price")
            .isFloat({ gt: 0 })
            .withMessage("El precio de la consulta debe ser un número mayor a 0"),

        body("commission_percentage")
            .isFloat({ min: 0, max: 100 })
            .withMessage("La comisión debe ser un número entre 0 y 100"),
    ];

    public updateMedicalSpecialtyValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

        body("consultation_price")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("El precio de la consulta debe ser un número mayor a 0"),

        body("commission_percentage")
            .optional()
            .isFloat({ min: 0, max: 100 })
            .withMessage("La comisión debe ser un número entre 0 y 100"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un número entero positivo"),
    ];

    public MedicalSpecialtyExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const specialty = await prisma.medicalSpecialty.findUnique({ where: { id: Number(value) } });

                if (!specialty) {
                    return Promise.reject("La especialidad médica no existe");
                }
            }),
    ];
}
