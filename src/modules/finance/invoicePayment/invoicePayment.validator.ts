import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class InvoicePaymentValidator {

    public createInvoicePaymentValidator: ValidationChain[] = [
        body("invoiceId")
            .isInt({ gt: 0 })
            .withMessage("invoiceId debe ser un entero positivo")
            .custom(async (value) => {
                const invoice = await prisma.invoice.findUnique({ where: { id: Number(value) } });
                if (!invoice) {
                    return Promise.reject("La factura no existe");
                }
            }),

        body("paymentMethodId")
            .isInt({ gt: 0 })
            .withMessage("paymentMethodId debe ser un entero positivo")
            .custom(async (value) => {
                const method = await prisma.paymentMethod.findUnique({ where: { id: Number(value) } });
                if (!method) {
                    return Promise.reject("El método de pago no existe");
                }
            }),

        body("amount_paid")
            .isFloat({ gt: 0 })
            .withMessage("amount_paid debe ser un número mayor a 0"),

        body("exchangeRateId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("exchangeRateId debe ser un entero positivo")
            .custom(async (value) => {
                const rate = await prisma.exchangeRate.findUnique({ where: { id: Number(value) } });
                if (!rate) {
                    return Promise.reject("La tasa de cambio no existe");
                }
            }),
    ];

    public updateInvoicePaymentValidator: ValidationChain[] = [
        body("paymentMethodId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("paymentMethodId debe ser un entero positivo")
            .custom(async (value) => {
                const method = await prisma.paymentMethod.findUnique({ where: { id: Number(value) } });
                if (!method) {
                    return Promise.reject("El método de pago no existe");
                }
            }),

        body("amount_paid")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("amount_paid debe ser un número mayor a 0"),

        body("exchangeRateId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("exchangeRateId debe ser un entero positivo")
            .custom(async (value) => {
                const rate = await prisma.exchangeRate.findUnique({ where: { id: Number(value) } });
                if (!rate) {
                    return Promise.reject("La tasa de cambio no existe");
                }
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public InvoicePaymentExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const payment = await prisma.invoicePayment.findUnique({ where: { id: Number(value) } });
                if (!payment) {
                    return Promise.reject("El pago de factura no existe");
                }
            }),
    ];
}
