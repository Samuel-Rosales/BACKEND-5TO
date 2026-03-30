import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class InvoiceExpenseValidator {

    public createInvoiceExpenseValidator: ValidationChain[] = [
        body("categoryId")
            .isInt({ gt: 0 })
            .withMessage("El categoryId debe ser un número entero positivo")
            .custom(async (value) => {
                const category = await prisma.expenseCategory.findUnique({ where: { id: Number(value) } });

                if (!category) {
                    return Promise.reject("La categoría de gasto no existe");
                }
            }),

        body("supplierId")
            .isInt({ gt: 0 })
            .withMessage("El supplierId debe ser un número entero positivo")
            .custom(async (value) => {
                const supplier = await prisma.supplier.findUnique({ where: { id: Number(value) } });

                if (!supplier) {
                    return Promise.reject("El proveedor no existe");
                }
            }),

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

        body("total_amount")
            .isFloat({ gt: 0 })
            .withMessage("total_amount debe ser un número mayor a 0"),

        body("payments")
            .isArray({ min: 1 })
            .withMessage("payments debe ser un array con al menos 1 pago"),

        body("payments.*.paymentMethodId")
            .isInt({ gt: 0 })
            .withMessage("Cada paymentMethodId debe ser un número entero positivo"),

        body("payments.*.amount")
            .isFloat({ gt: 0 })
            .withMessage("El amount de cada pago debe ser un número mayor a 0"),

        body("payments.*.date_at")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("payments.*.date_at debe ser una fecha válida (ISO)");
                }

                return true;
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

    public updateInvoiceExpenseValidator: ValidationChain[] = [
        body("categoryId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El categoryId debe ser un número entero positivo")
            .custom(async (value) => {
                const category = await prisma.expenseCategory.findUnique({ where: { id: Number(value) } });

                if (!category) {
                    return Promise.reject("La categoría de gasto no existe");
                }
            }),

        body("supplierId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El supplierId debe ser un número entero positivo")
            .custom(async (value) => {
                const supplier = await prisma.supplier.findUnique({ where: { id: Number(value) } });

                if (!supplier) {
                    return Promise.reject("El proveedor no existe");
                }
            }),

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

        body("total_amount")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("total_amount debe ser un número mayor a 0"),

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
            .withMessage("El ID del gasto debe ser un número entero positivo"),
    ];

    public InvoiceExpenseExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const invoice = await prisma.invoiceExpense.findUnique({ where: { id: Number(value) } });

                if (!invoice) {
                    return Promise.reject("El gasto no existe");
                }
            }),
    ];
}
