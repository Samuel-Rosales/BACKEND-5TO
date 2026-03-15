import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class ExpensePaymentValidator {

    public createExpensePaymentValidator: ValidationChain[] = [
        body("invoiceExpenseId")
            .isInt({ gt: 0 })
            .withMessage("El invoiceExpenseId debe ser un número entero positivo")
            .custom(async (value) => {
                const invoice = await prisma.invoiceExpense.findUnique({ where: { id: Number(value) } });

                if (!invoice) {
                    return Promise.reject("El gasto no existe");
                }
            }),

        body("paymentMethodId")
            .isInt({ gt: 0 })
            .withMessage("El paymentMethodId debe ser un número entero positivo")
            .custom(async (value) => {
                const paymentMethod = await prisma.paymentMethod.findUnique({ where: { id: Number(value) } });

                if (!paymentMethod) {
                    return Promise.reject("El método de pago no existe");
                }
            }),

        body("amount")
            .isFloat({ gt: 0 })
            .withMessage("amount debe ser un número mayor a 0"),

        body("igtf_amount")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("igtf_amount debe ser un número mayor o igual a 0"),

        body("exchangeRateId")
            .isInt({ gt: 0 })
            .withMessage("El exchangeRateId debe ser un número entero positivo")
            .custom(async (value) => {
                const exchangeRate = await prisma.exchangeRate.findUnique({ where: { id: Number(value) } });

                if (!exchangeRate) {
                    return Promise.reject("La tasa de cambio no existe");
                }
            }),

        body("date_at")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("date_at debe ser una fecha válida (ISO)");
                }

                return true;
            }),
    ];

    public updateExpensePaymentValidator: ValidationChain[] = [
        body("invoiceExpenseId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El invoiceExpenseId debe ser un número entero positivo")
            .custom(async (value) => {
                const invoice = await prisma.invoiceExpense.findUnique({ where: { id: Number(value) } });

                if (!invoice) {
                    return Promise.reject("El gasto no existe");
                }
            }),

        body("paymentMethodId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El paymentMethodId debe ser un número entero positivo")
            .custom(async (value) => {
                const paymentMethod = await prisma.paymentMethod.findUnique({ where: { id: Number(value) } });

                if (!paymentMethod) {
                    return Promise.reject("El método de pago no existe");
                }
            }),

        body("amount")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("amount debe ser un número mayor a 0"),

        body("igtf_amount")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("igtf_amount debe ser un número mayor o igual a 0"),

        body("exchangeRateId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El exchangeRateId debe ser un número entero positivo")
            .custom(async (value) => {
                const exchangeRate = await prisma.exchangeRate.findUnique({ where: { id: Number(value) } });

                if (!exchangeRate) {
                    return Promise.reject("La tasa de cambio no existe");
                }
            }),

        body("date_at")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("date_at debe ser una fecha válida (ISO)");
                }

                return true;
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del pago de gasto debe ser un número entero positivo"),
    ];

    public ExpensePaymentExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const payment = await prisma.expensePayment.findUnique({ where: { id: Number(value) } });

                if (!payment) {
                    return Promise.reject("El pago de gasto no existe");
                }
            }),
    ];
}
