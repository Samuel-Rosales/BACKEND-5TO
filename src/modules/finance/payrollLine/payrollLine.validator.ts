import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class PayrollLineValidator {

    public createPayrollLineValidator: ValidationChain[] = [
        body("payrollId")
            .isInt({ gt: 0 })
            .withMessage("payrollId debe ser un entero positivo")
            .custom(async (value) => {
                const payroll = await prisma.payroll.findUnique({ where: { id: Number(value) } });
                if (!payroll) {
                    return Promise.reject("La nómina no existe");
                }
            }),

        body("consultationId")
            .isInt({ gt: 0 })
            .withMessage("consultationId debe ser un entero positivo")
            .custom(async (value) => {
                const consultation = await prisma.consultation.findUnique({ where: { id: Number(value) } });
                if (!consultation) {
                    return Promise.reject("La consulta no existe");
                }

                const exists = await prisma.payrollLine.findFirst({ where: { consultationId: Number(value) } });
                if (exists) {
                    return Promise.reject("La consulta ya fue incluida en una nómina");
                }
            }),

        body("base_amount")
            .isFloat({ gt: 0 })
            .withMessage("base_amount debe ser un número mayor a 0"),

        body("commission_percentage")
            .isFloat({ min: 0, max: 100 })
            .withMessage("commission_percentage debe estar entre 0 y 100"),
    ];

    public updatePayrollLineValidator: ValidationChain[] = [
        body("payrollId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("payrollId debe ser un entero positivo")
            .custom(async (value) => {
                const payroll = await prisma.payroll.findUnique({ where: { id: Number(value) } });
                if (!payroll) {
                    return Promise.reject("La nómina no existe");
                }
            }),

        body("consultationId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("consultationId debe ser un entero positivo")
            .custom(async (value, { req }) => {
                const consultation = await prisma.consultation.findUnique({ where: { id: Number(value) } });
                if (!consultation) {
                    return Promise.reject("La consulta no existe");
                }

                const currentId = Number(req?.params?.id ?? 0);
                const exists = await prisma.payrollLine.findFirst({
                    where: {
                        consultationId: Number(value),
                        NOT: { id: currentId },
                    },
                });
                if (exists) {
                    return Promise.reject("La consulta ya fue incluida en una nómina");
                }
            }),

        body("base_amount")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("base_amount debe ser un número mayor a 0"),

        body("commission_percentage")
            .optional()
            .isFloat({ min: 0, max: 100 })
            .withMessage("commission_percentage debe estar entre 0 y 100"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public PayrollLineExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const line = await prisma.payrollLine.findUnique({ where: { id: Number(value) } });
                if (!line) {
                    return Promise.reject("La línea de nómina no existe");
                }
            }),
    ];
}
