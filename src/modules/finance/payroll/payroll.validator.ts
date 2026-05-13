import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class PayrollValidator {

    public createPayrollValidator: ValidationChain[] = [
        body("period_start")
            .isISO8601()
            .withMessage("period_start debe ser una fecha ISO válida"),

        body("period_end")
            .isISO8601()
            .withMessage("period_end debe ser una fecha ISO válida")
            .custom((value, { req }) => {
                const start = new Date(req.body.period_start);
                const end = new Date(value);

                if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                    throw new Error("El rango de fechas no es válido");
                }

                if (end < start) {
                    throw new Error("period_end debe ser mayor o igual a period_start");
                }

                return true;
            }),

        body("status")
            .optional()
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage("status debe tener entre 2 y 30 caracteres"),
    ];

    public updatePayrollValidator: ValidationChain[] = [
        body("period_start")
            .optional()
            .isISO8601()
            .withMessage("period_start debe ser una fecha ISO válida"),

        body("period_end")
            .optional()
            .isISO8601()
            .withMessage("period_end debe ser una fecha ISO válida"),

        body("status")
            .optional()
            .trim()
            .isLength({ min: 2, max: 30 })
            .withMessage("status debe tener entre 2 y 30 caracteres"),

        body()
            .custom((_, { req }) => {
                if (req.body.period_start && req.body.period_end) {
                    const start = new Date(req.body.period_start);
                    const end = new Date(req.body.period_end);

                    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                        throw new Error("El rango de fechas no es válido");
                    }

                    if (end < start) {
                        throw new Error("period_end debe ser mayor o igual a period_start");
                    }
                }

                return true;
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public PayrollExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const payroll = await prisma.payroll.findUnique({ where: { id: Number(value) } });

                if (!payroll) {
                    return Promise.reject("La nómina no existe");
                }
            }),
    ];
}
