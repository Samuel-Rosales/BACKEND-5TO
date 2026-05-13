import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class DiagnosisValidator {
    public createDiagnosisValidator: ValidationChain[] = [
        body("code")
            .trim()
            .isLength({ min: 1, max: 20 })
            .withMessage("El código debe tener entre 1 y 20 caracteres")
            .custom(async (value) => {
                const existing = await prisma.diagnosis.findUnique({ where: { code: String(value).trim() } });
                if (existing) {
                    return Promise.reject("El código del diagnóstico ya existe");
                }
            }),

        body("description")
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("La descripción debe tener entre 1 y 5000 caracteres"),

        body("category")
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage("La categoría debe tener entre 1 y 255 caracteres"),
    ];

    public updateDiagnosisValidator: ValidationChain[] = [
        body("code")
            .optional()
            .trim()
            .isLength({ min: 1, max: 20 })
            .withMessage("El código debe tener entre 1 y 20 caracteres")
            .custom(async (value, { req }) => {
                const existing = await prisma.diagnosis.findUnique({ where: { code: String(value).trim() } });
                const currentId = Number(req.params?.id ?? 0);
                if (existing && existing.id !== currentId) {
                    return Promise.reject("El código del diagnóstico ya existe");
                }
            }),

        body("description")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("La descripción debe tener entre 1 y 5000 caracteres"),

        body("category")
            .optional()
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage("La categoría debe tener entre 1 y 255 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del diagnóstico debe ser un número entero positivo"),
    ];

    public DiagnosisExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const diagnosis = await prisma.diagnosis.findUnique({ where: { id: Number(value) } });

                if (!diagnosis) {
                    return Promise.reject("El diagnóstico no existe");
                }
            }),
    ];
}
