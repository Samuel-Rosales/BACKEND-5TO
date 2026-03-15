import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class DoctorScheduleOverrideValidator {

    public createDoctorScheduleOverrideValidator: ValidationChain[] = [
        body("doctorId")
            .isInt({ gt: 0 })
            .withMessage("El doctorId debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor || !doctor.active) {
                    return Promise.reject("El doctor no existe o no está activo");
                }
            }),

        body("specific_date")
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("specific_date debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("is_working")
            .optional()
            .isBoolean()
            .withMessage("is_working debe ser boolean"),

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

                if (startCandidate === undefined) {
                    throw new Error("start_time es requerido cuando end_time está presente");
                }

                if (isValidDateString(startCandidate)) {
                    const start = new Date(startCandidate);
                    const end = new Date(value);

                    if (end <= start) {
                        throw new Error("end_time debe ser mayor que start_time");
                    }
                }

                return true;
            }),

        body("reason")
            .optional()
            .trim()
            .isLength({ min: 1, max: 500 })
            .withMessage("reason debe tener entre 1 y 500 caracteres"),

        body().custom((_, { req }) => {
            const isWorking = req.body.is_working;

            if (isWorking === false) {
                return true;
            }

            // Si está trabajando (o no se envió is_working), permitir sin horas,
            // pero si se envía una, exigir ambas (se valida arriba en end_time).
            if (req.body.start_time !== undefined && req.body.end_time === undefined) {
                throw new Error("end_time es requerido cuando start_time está presente");
            }

            return true;
        }),
    ];

    public updateDoctorScheduleOverrideValidator: ValidationChain[] = [
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

        body("specific_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("specific_date debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("is_working")
            .optional()
            .isBoolean()
            .withMessage("is_working debe ser boolean"),

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

                if (startCandidate === undefined) {
                    return true;
                }

                if (isValidDateString(startCandidate)) {
                    const start = new Date(startCandidate);
                    const end = new Date(value);

                    if (end <= start) {
                        throw new Error("end_time debe ser mayor que start_time");
                    }
                }

                return true;
            }),

        body("reason")
            .optional()
            .trim()
            .isLength({ min: 1, max: 500 })
            .withMessage("reason debe tener entre 1 y 500 caracteres"),

        body().custom((_, { req }) => {
            if (req.body.start_time !== undefined && req.body.end_time === undefined) {
                throw new Error("end_time es requerido cuando start_time está presente");
            }

            if (req.body.end_time !== undefined && req.body.start_time === undefined) {
                throw new Error("start_time es requerido cuando end_time está presente");
            }

            return true;
        }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del override debe ser un número entero positivo"),
    ];

    public DoctorScheduleOverrideExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const override = await prisma.doctorScheduleOverride.findUnique({ where: { id: Number(value) } });

                if (!override) {
                    return Promise.reject("El override no existe");
                }
            }),
    ];
}
