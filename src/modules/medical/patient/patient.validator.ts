import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class PatientValidator {

    public createPatientValidator: ValidationChain[] = [
        body("userId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El userId debe ser un número entero positivo")
            .custom(async (value) => {
                const userId = Number(value);

                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (!user || !user.active) {
                    return Promise.reject("El usuario no existe o no está activo");
                }

                const existingPatient = await prisma.patient.findUnique({ where: { userId } });

                if (existingPatient && existingPatient.active) {
                    return Promise.reject("Ya existe un paciente asociado a este usuario");
                }
            }),

        body("tipo_sangre")
            .optional()
            .trim()
            .isLength({ min: 1, max: 10 })
            .withMessage("El tipo de sangre debe tener entre 1 y 10 caracteres"),

        body("medical_history")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("El historial médico debe tener entre 1 y 5000 caracteres"),
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

                const existingPatient = await prisma.patient.findUnique({ where: { userId } });

                if (existingPatient && existingPatient.id !== patientId && existingPatient.active) {
                    return Promise.reject("Ya existe un paciente asociado a este usuario");
                }
            }),

        body("tipo_sangre")
            .optional()
            .trim()
            .isLength({ min: 1, max: 10 })
            .withMessage("El tipo de sangre debe tener entre 1 y 10 caracteres"),

        body("medical_history")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("El historial médico debe tener entre 1 y 5000 caracteres"),
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
