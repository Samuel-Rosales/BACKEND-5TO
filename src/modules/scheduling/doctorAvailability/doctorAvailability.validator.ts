import { prisma } from "@/configs";
import { body, param, query, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class DoctorAvailabilityValidator {

    public findAllDoctorAvailabilityValidator: ValidationChain[] = [
        query("doctorId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("doctorId debe ser un número entero positivo"),

        query("specialtyId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("specialtyId debe ser un número entero positivo"),

        query("day_of_week")
            .optional()
            .isInt({ min: 0, max: 6 })
            .withMessage("day_of_week debe ser un número entre 0 y 6"),

        query("date")
            .optional()
            .matches(/^\d{4}-\d{2}-\d{2}$/)
            .withMessage("date debe tener formato YYYY-MM-DD"),

        query("morning")
            .optional()
            .custom((value) => {
                if (value === "true" || value === "false") return true;
                throw new Error("morning debe ser 'true' o 'false'");
            }),
    ];

    public createDoctorAvailabilityValidator: ValidationChain[] = [
        body("doctorId")
            .isInt({ gt: 0 })
            .withMessage("El doctorId debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor || !doctor.active) {
                    return Promise.reject("El doctor no existe o no está activo");
                }
            }),

        body("day_of_week")
            .isInt({ min: 0, max: 6 })
            .withMessage("day_of_week debe ser un número entre 0 y 6"),

        body("start_time")
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("start_time debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("end_time")
            .custom((value, { req }) => {
                if (!isValidDateString(value)) {
                    throw new Error("end_time debe ser una fecha válida (ISO)");
                }

                if (isValidDateString(req.body.start_time)) {
                    const start = new Date(req.body.start_time);
                    const end = new Date(value);

                    if (end <= start) {
                        throw new Error("end_time debe ser mayor que start_time");
                    }
                }

                return true;
            }),

        body("patient_limit")
            .isInt({ gt: 0 })
            .withMessage("patient_limit debe ser un entero mayor a 0"),
    ];

    public updateDoctorAvailabilityValidator: ValidationChain[] = [
        body("doctorId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El doctorId debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor || !doctor.active) {
                    return Promise.reject("El doctor no existe o no está activo");
                }
            }),

        body("day_of_week")
            .optional()
            .isInt({ min: 0, max: 6 })
            .withMessage("day_of_week debe ser un número entre 0 y 6"),

        body("start_time")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("start_time debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("end_time")
            .optional()
            .custom((value, { req }) => {
                if (!isValidDateString(value)) {
                    throw new Error("end_time debe ser una fecha válida (ISO)");
                }

                const startCandidate = req.body.start_time;

                if (isValidDateString(startCandidate)) {
                    const start = new Date(startCandidate);
                    const end = new Date(value);

                    if (end <= start) {
                        throw new Error("end_time debe ser mayor que start_time");
                    }
                }

                return true;
            }),

        body("patient_limit")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("patient_limit debe ser un entero mayor a 0"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID de la disponibilidad debe ser un número entero positivo"),
    ];

    public DoctorAvailabilityExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const availability = await prisma.doctorAvailability.findUnique({ where: { id: Number(value) } });

                if (!availability) {
                    return Promise.reject("La disponibilidad no existe");
                }
            }),
    ];
}
