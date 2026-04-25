import { prisma } from "@/configs";
import { body, param, query, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class DoctorScheduleValidator {

    public findAllDoctorScheduleValidator: ValidationChain[] = [
        query("doctorId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("doctorId debe ser un número entero positivo"),
    ];

    public createDoctorScheduleValidator: ValidationChain[] = [
        body("doctorId")
            .isInt({ gt: 0 })
            .withMessage("El doctorId debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor || !doctor.active) {
                    return Promise.reject("El doctor no existe o no está activo");
                }
            }),

        body("period_start")
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("period_start debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("period_end")
            .optional({ nullable: true })
            .custom((value, { req }) => {
                if (value === null || value === undefined) {
                    return true;
                }

                if (!isValidDateString(value)) {
                    throw new Error("period_end debe ser una fecha válida (ISO)");
                }

                if (isValidDateString(req.body.period_start)) {
                    const start = new Date(req.body.period_start);
                    const end = new Date(value);

                    if (end <= start) {
                        throw new Error("period_end debe ser mayor que period_start");
                    }
                }

                return true;
            }),
    ];

    public updateDoctorScheduleValidator: ValidationChain[] = [
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

        body("period_start")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("period_start debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("period_end")
            .optional({ nullable: true })
            .custom((value, { req }) => {
                if (value === null || value === undefined) {
                    return true;
                }

                if (!isValidDateString(value)) {
                    throw new Error("period_end debe ser una fecha válida (ISO)");
                }

                if (req.body.period_start !== undefined && isValidDateString(req.body.period_start)) {
                    const start = new Date(req.body.period_start);
                    const end = new Date(value);

                    if (end <= start) {
                        throw new Error("period_end debe ser mayor que period_start");
                    }
                }

                return true;
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del DoctorSchedule debe ser un número entero positivo"),
    ];

    public DoctorScheduleExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const schedule = await prisma.doctorSchedule.findUnique({ where: { id: Number(value) } });

                if (!schedule) {
                    return Promise.reject("El DoctorSchedule no existe");
                }
            }),
    ];
}
