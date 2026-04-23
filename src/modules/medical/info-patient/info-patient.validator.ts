import { prisma } from "@/configs";
import { Sex } from "@prisma/client";
import { body, param, ValidationChain } from "express-validator";

export class InfoPatientValidator {

    public createInfoPatientValidator: ValidationChain[] = [
        body("ci")
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage("La cédula del paciente debe tener entre 3 y 30 caracteres"),

        body("name")
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre del paciente debe tener entre 2 y 120 caracteres"),

        body("last_name")
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El apellido del paciente debe tener entre 2 y 120 caracteres"),

        body("sex")
            .isIn(Object.values(Sex))
            .withMessage("El sexo del paciente es inválido"),

        body("birth_date")
            .isISO8601()
            .withMessage("La fecha de nacimiento debe ser válida"),

        body("blood_type")
            .optional()
            .trim()
            .isLength({ min: 1, max: 10 })
            .withMessage("El tipo de sangre debe tener entre 1 y 10 caracteres"),

        body("nacionality")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("La nacionalidad debe tener entre 2 y 100 caracteres"),

        body("profession")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("La profesión debe tener entre 2 y 100 caracteres"),

        body("main_phone")
            .optional()
            .trim()
            .isLength({ min: 6, max: 20 })
            .withMessage("El teléfono principal debe tener entre 6 y 20 caracteres"),

        body("secondary_phone")
            .optional()
            .trim()
            .isLength({ min: 6, max: 20 })
            .withMessage("El teléfono secundario debe tener entre 6 y 20 caracteres"),

        body("email")
            .optional()
            .isEmail()
            .withMessage("El email no es válido"),

        body("address")
            .optional()
            .trim()
            .isLength({ min: 5, max: 500 })
            .withMessage("La dirección debe tener entre 5 y 500 caracteres"),

        body("city")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("La ciudad debe tener entre 2 y 100 caracteres"),

        body("allergies")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Las alergias deben tener entre 1 y 5000 caracteres"),

        body("chronic_diseases")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Las enfermedades crónicas deben tener entre 1 y 5000 caracteres"),

        body("current_medications")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Los medicamentos actuales deben tener entre 1 y 5000 caracteres"),

        body("previous_surgeries")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Las cirugías previas deben tener entre 1 y 5000 caracteres"),

        body("last_visit_at")
            .optional({ nullable: true })
            .isISO8601()
            .withMessage("La fecha de la última visita debe ser válida"),
    ];

    public updateInfoPatientValidator: ValidationChain[] = [
        body("patientId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El patientId debe ser un número entero positivo")
            .custom(async (value) => {
                const patient = await prisma.patient.findUnique({ where: { id: Number(value) } });
                if (!patient || !patient.active) {
                    return Promise.reject("El paciente no existe o no está activo");
                }
            }),

        body("ci")
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage("La cédula del paciente debe tener entre 3 y 30 caracteres"),

        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre del paciente debe tener entre 2 y 120 caracteres"),

        body("last_name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El apellido del paciente debe tener entre 2 y 120 caracteres"),

        body("sex")
            .optional()
            .isIn(Object.values(Sex))
            .withMessage("El sexo del paciente es inválido"),

        body("birth_date")
            .optional()
            .isISO8601()
            .withMessage("La fecha de nacimiento debe ser válida"),

        body("blood_type")
            .optional()
            .trim()
            .isLength({ min: 1, max: 10 })
            .withMessage("El tipo de sangre debe tener entre 1 y 10 caracteres"),

        body("nacionality")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("La nacionalidad debe tener entre 2 y 100 caracteres"),

        body("profession")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("La profesión debe tener entre 2 y 100 caracteres"),

        body("main_phone")
            .optional()
            .trim()
            .isLength({ min: 6, max: 20 })
            .withMessage("El teléfono principal debe tener entre 6 y 20 caracteres"),

        body("secondary_phone")
            .optional()
            .trim()
            .isLength({ min: 6, max: 20 })
            .withMessage("El teléfono secundario debe tener entre 6 y 20 caracteres"),

        body("email")
            .optional()
            .isEmail()
            .withMessage("El email no es válido"),

        body("address")
            .optional()
            .trim()
            .isLength({ min: 5, max: 500 })
            .withMessage("La dirección debe tener entre 5 y 500 caracteres"),

        body("city")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("La ciudad debe tener entre 2 y 100 caracteres"),

        body("allergies")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Las alergias deben tener entre 1 y 5000 caracteres"),

        body("chronic_diseases")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Las enfermedades crónicas deben tener entre 1 y 5000 caracteres"),

        body("current_medications")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Los medicamentos actuales deben tener entre 1 y 5000 caracteres"),

        body("previous_surgeries")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Las cirugías previas deben tener entre 1 y 5000 caracteres"),

        body("last_visit_at")
            .optional({ nullable: true })
            .isISO8601()
            .withMessage("La fecha de la última visita debe ser válida"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("patientId")
            .isInt({ gt: 0 })
            .withMessage("El ID del paciente debe ser un número entero positivo"),
    ];

    public PatientExistsValidator: ValidationChain[] = [
        param("patientId")
            .custom(async (value) => {
                const patient = await prisma.patient.findUnique({ where: { id: Number(value) } });

                if (!patient || !patient.active) {
                    return Promise.reject("El paciente no existe o no está activo");
                }
            }),
    ];
}
