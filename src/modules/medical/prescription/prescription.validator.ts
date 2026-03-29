import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class PrescriptionValidator {

    public createPrescriptionValidator: ValidationChain[] = [
        body("consultationId")
            .isInt({ gt: 0 })
            .withMessage("El consultationId debe ser un número entero positivo")
            .custom(async (value) => {
                const consultation = await prisma.consultation.findUnique({ where: { id: Number(value) } });

                if (!consultation) {
                    return Promise.reject("La consulta no existe");
                }
            }),

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

        body("medication_name")
            .optional()
            .trim()
            .isLength({ min: 1, max: 150 })
            .withMessage("El nombre del medicamento debe tener entre 1 y 150 caracteres"),

        body("dosage")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("La dosis debe tener entre 1 y 100 caracteres"),

        body("frequency")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("La frecuencia debe tener entre 1 y 100 caracteres"),

        body("duration")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("La duración debe tener entre 1 y 100 caracteres"),

        body("instructions")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Las instrucciones deben tener entre 1 y 5000 caracteres"),

        body()
            .custom((_, { req }) => {
                if (!req.body.supplyId && !req.body.medication_name) {
                    throw new Error("Debe indicar supplyId o medication_name");
                }

                return true;
            }),
    ];

    public updatePrescriptionValidator: ValidationChain[] = [
        body("consultationId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El consultationId debe ser un número entero positivo")
            .custom(async (value) => {
                const consultation = await prisma.consultation.findUnique({ where: { id: Number(value) } });

                if (!consultation) {
                    return Promise.reject("La consulta no existe");
                }
            }),

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

        body("medication_name")
            .optional()
            .trim()
            .isLength({ min: 1, max: 150 })
            .withMessage("El nombre del medicamento debe tener entre 1 y 150 caracteres"),

        body("dosage")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("La dosis debe tener entre 1 y 100 caracteres"),

        body("frequency")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("La frecuencia debe tener entre 1 y 100 caracteres"),

        body("duration")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("La duración debe tener entre 1 y 100 caracteres"),

        body("instructions")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Las instrucciones deben tener entre 1 y 5000 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID de la prescripción debe ser un número entero positivo"),
    ];

    public PrescriptionExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const prescription = await prisma.prescription.findUnique({ where: { id: Number(value) } });

                if (!prescription) {
                    return Promise.reject("La prescripción no existe");
                }
            }),
    ];
}
