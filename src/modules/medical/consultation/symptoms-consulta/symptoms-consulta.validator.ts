import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class SymptomsConsultaValidator {
    public SymptomsConsultaIdParamValidator: ValidationChain[] = [
        param("symptomsConsultaId")
            .isInt({ gt: 0 })
            .withMessage("El ID del síntoma de la consulta debe ser un número entero positivo"),
    ];

    public SymptomsConsultaExistsForConsultationValidator: ValidationChain[] = [
        param("symptomsConsultaId").custom(async (value, { req }) => {
            const consultationId = Number(req.params?.id ?? 0);
            const symptomsConsultaId = Number(value);

            const item = await prisma.symptomsConsultation.findFirst({
                where: { id: symptomsConsultaId, consultation_id: consultationId },
            });

            if (!item) {
                return Promise.reject("El síntoma no pertenece a la consulta o no existe");
            }
        }),
    ];

    public createValidator: ValidationChain[] = [
        body("symptomId")
            .isInt({ gt: 0 })
            .withMessage("symptomId debe ser un entero positivo")
            .custom(async (value) => {
                const symptom = await prisma.symptoms.findUnique({ where: { id: Number(value) } });
                if (!symptom) return Promise.reject("El síntoma no existe");
            }),

        body("severity")
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage("severity debe tener entre 1 y 50 caracteres"),

        body("duration")
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("duration debe tener entre 1 y 100 caracteres"),

        body("notes")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("notes debe tener entre 1 y 5000 caracteres"),
    ];

    public updateValidator: ValidationChain[] = [
        body("symptomId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("symptomId debe ser un entero positivo")
            .custom(async (value) => {
                const symptom = await prisma.symptoms.findUnique({ where: { id: Number(value) } });
                if (!symptom) return Promise.reject("El síntoma no existe");
            }),

        body("severity")
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage("severity debe tener entre 1 y 50 caracteres"),

        body("duration")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("duration debe tener entre 1 y 100 caracteres"),

        body("notes")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("notes debe tener entre 1 y 5000 caracteres"),
    ];
}
