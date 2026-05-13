import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class ConsultationDiagnosisValidator {
    public ConsultationDiagnosisIdParamValidator: ValidationChain[] = [
        param("consultationDiagnosisId")
            .isInt({ gt: 0 })
            .withMessage("El ID del diagnóstico de la consulta debe ser un número entero positivo"),
    ];

    public ConsultationDiagnosisExistsForConsultationValidator: ValidationChain[] = [
        param("consultationDiagnosisId").custom(async (value, { req }) => {
            const consultationId = Number(req.params?.id ?? 0);
            const consultationDiagnosisId = Number(value);

            const item = await prisma.consultationDiagnosis.findFirst({
                where: { id: consultationDiagnosisId, consultation_id: consultationId },
            });

            if (!item) {
                return Promise.reject("El diagnóstico no pertenece a la consulta o no existe");
            }
        }),
    ];

    public createValidator: ValidationChain[] = [
        body("diagnosisId")
            .isInt({ gt: 0 })
            .withMessage("diagnosisId debe ser un entero positivo")
            .custom(async (value) => {
                const diagnosis = await prisma.diagnosis.findUnique({ where: { id: Number(value) } });
                if (!diagnosis) return Promise.reject("El diagnóstico no existe");
            }),

        body("is_primary")
            .isBoolean()
            .withMessage("is_primary debe ser boolean")
            .custom(async (value, { req }) => {
                if (value !== true) return;
                const consultationId = Number(req.params?.id ?? 0);
                const existing = await prisma.consultationDiagnosis.findFirst({
                    where: { consultation_id: consultationId, is_primary: true },
                });
                if (existing) {
                    return Promise.reject("Solo puede existir un diagnóstico primario");
                }
            }),

        body("condition_status")
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage("condition_status debe tener entre 1 y 50 caracteres"),

        body("onset_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("onset_date debe ser una fecha válida (ISO)");
                }
                return true;
            }),
    ];

    public updateValidator: ValidationChain[] = [
        body("diagnosisId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("diagnosisId debe ser un entero positivo")
            .custom(async (value) => {
                const diagnosis = await prisma.diagnosis.findUnique({ where: { id: Number(value) } });
                if (!diagnosis) return Promise.reject("El diagnóstico no existe");
            }),

        body("is_primary")
            .optional()
            .isBoolean()
            .withMessage("is_primary debe ser boolean")
            .custom(async (value, { req }) => {
                if (value !== true) return;
                const consultationId = Number(req.params?.id ?? 0);
                const consultationDiagnosisId = Number(req.params?.consultationDiagnosisId ?? 0);

                const existing = await prisma.consultationDiagnosis.findFirst({
                    where: {
                        consultation_id: consultationId,
                        is_primary: true,
                        NOT: { id: consultationDiagnosisId },
                    },
                });

                if (existing) {
                    return Promise.reject("Solo puede existir un diagnóstico primario");
                }
            }),

        body("condition_status")
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage("condition_status debe tener entre 1 y 50 caracteres"),

        body("onset_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("onset_date debe ser una fecha válida (ISO)");
                }
                return true;
            }),
    ];
}
