import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class PatientValidator {

    public createPatientReceptionValidator: ValidationChain[] = [
        body("ci")
            .trim()
            .notEmpty().withMessage("La cédula es requerida")
            .isString().withMessage("La cédula debe ser texto")
            .matches(/^\d{6,10}$/).withMessage("La cédula debe contener solo números (entre 6 y 10 dígitos)")
            .custom(async (value) => {
                const ci = String(value).trim();

                const existingUser = await prisma.user.findFirst({
                    where: { ci, active: true },
                    select: { id: true },
                });
                if (existingUser) {
                    return Promise.reject("Ya existe un usuario con esa cédula");
                }

                const existingPatient = await prisma.patient.findFirst({
                    where: { ci, active: true },
                    select: { id: true },
                });
                if (existingPatient) {
                    return Promise.reject("Ya existe un paciente activo con esa cédula");
                }
            }),

        body("name")
            .trim()
            .notEmpty().withMessage("El nombre es requerido")
            .isString().withMessage("El nombre debe ser texto")
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre del paciente debe tener entre 2 y 120 caracteres"),
    ];

    public createPatientValidator: ValidationChain[] = [
        body("userId")
            .notEmpty()
            .withMessage("El userId es requerido")
            .isInt({ gt: 0 })
            .withMessage("El userId debe ser un número entero positivo")
            .custom(async (value) => {
                const userId = Number(value);

                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (!user || !user.active) {
                    return Promise.reject("El usuario no existe o no está activo");
                }

                const existingPatient = await prisma.patient.findFirst({
                    where: { userId, active: true },
                    select: { id: true },
                });

                if (existingPatient) {
                    return Promise.reject("Ese usuario ya tiene un paciente asociado");
                }
            }),

        body("ci")
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage("La cédula del paciente debe tener entre 3 y 30 caracteres")
            .custom(async (value) => {
                const ci = String(value).trim();
                if (!ci) return true;

                const existingPatient = await prisma.patient.findFirst({
                    where: {
                        ci,
                        active: true,
                    },
                    select: { id: true },
                });

                if (existingPatient) {
                    return Promise.reject("Ya existe un paciente activo con esa cédula");
                }
            }),

        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre del paciente debe tener entre 2 y 120 caracteres"),

        body()
            .custom((_, { req }) => {
                const ci = typeof req.body?.ci === "string" ? req.body.ci.trim() : "";
                const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

                // Si viene uno de ci/name, deben venir ambos.
                if ((ci && !name) || (!ci && name)) {
                    throw new Error("Debe enviar ambos campos: ci y name");
                }

                return true;
            }),
    ];

    public updatePatientValidator: ValidationChain[] = [
        body("userId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El userId debe ser un número entero positivo")
            .custom(async (value, { req }) => {
                const userId = Number(value);
                const patientId = Number(req.params?.id);

                if (!Number.isFinite(patientId)) {
                    return Promise.reject("ID del paciente inválido");
                }

                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (!user || !user.active) {
                    return Promise.reject("El usuario no existe o no está activo");
                }
            }),

        body("ci")
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage("La cédula del paciente debe tener entre 3 y 30 caracteres")
            .custom(async (value, { req }) => {
                const ci = String(value).trim();
                if (!ci) return true;

                const patientId = Number(req.params?.id);

                const existingPatient = await prisma.patient.findFirst({
                    where: {
                        ci,
                        active: true,
                        id: { not: patientId },
                    },
                    select: { id: true },
                });

                if (existingPatient) {
                    return Promise.reject("Ya existe un paciente activo con esa cédula");
                }
            }),

        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre del paciente debe tener entre 2 y 120 caracteres")
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del paciente debe ser un número entero positivo"),
    ];

    public PatientExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const patient = await prisma.patient.findUnique({ where: { id: Number(value) } });

                if (!patient || !patient.active) {
                    return Promise.reject("El paciente no existe o no está activo");
                }
            }),
    ];
}
