import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class ClinicalExaminationValidator {
    public ClinicalExaminationIdParamValidator: ValidationChain[] = [
        param("clinicalExaminationId")
            .isInt({ gt: 0 })
            .withMessage("El ID del examen clínico debe ser un número entero positivo"),
    ];

    public ClinicalExaminationExistsForConsultationValidator: ValidationChain[] = [
        param("clinicalExaminationId").custom(async (value, { req }) => {
            const consultationId = Number(req.params?.id ?? 0);
            const clinicalExaminationId = Number(value);

            const item = await prisma.clinicalExamination.findFirst({
                where: { id: clinicalExaminationId, consultation_id: consultationId },
            });

            if (!item) {
                return Promise.reject("El examen clínico no pertenece a la consulta o no existe");
            }
        }),
    ];

    public createValidator: ValidationChain[] = [
        body().custom((_, { req }) => {
            const fields = [
                "weight",
                "height",
                "temperature",
                "systolic_bp",
                "diastolic_bp",
                "heart_rate",
                "respiratory_rate",
                "oxygen_saturation",
            ] as const;

            const hasAny = fields.some((f) => req.body?.[f] !== undefined);
            if (!hasAny) {
                throw new Error("Debe enviar al menos un campo del examen clínico");
            }

            return true;
        }),

        body("weight")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("weight debe ser un número mayor a 0"),

        body("height")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("height debe ser un número mayor a 0"),

        body("temperature")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("temperature debe ser un número mayor a 0"),

        body("systolic_bp")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("systolic_bp debe ser un entero positivo"),

        body("diastolic_bp")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("diastolic_bp debe ser un entero positivo"),

        body("heart_rate")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("heart_rate debe ser un entero positivo"),

        body("respiratory_rate")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("respiratory_rate debe ser un entero positivo"),

        body("oxygen_saturation")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("oxygen_saturation debe ser un número mayor a 0"),
    ];

    public updateValidator: ValidationChain[] = [
        body("weight")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("weight debe ser un número mayor a 0"),

        body("height")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("height debe ser un número mayor a 0"),

        body("temperature")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("temperature debe ser un número mayor a 0"),

        body("systolic_bp")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("systolic_bp debe ser un entero positivo"),

        body("diastolic_bp")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("diastolic_bp debe ser un entero positivo"),

        body("heart_rate")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("heart_rate debe ser un entero positivo"),

        body("respiratory_rate")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("respiratory_rate debe ser un entero positivo"),

        body("oxygen_saturation")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("oxygen_saturation debe ser un número mayor a 0"),
    ];
}
