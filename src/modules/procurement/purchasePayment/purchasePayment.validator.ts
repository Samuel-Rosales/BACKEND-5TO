import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
};

export class PurchasePaymentValidator {

    public createPurchasePaymentValidator: ValidationChain[] = [
        body("purchaseId")
            .isInt({ gt: 0 })
            .withMessage("purchaseId debe ser un entero positivo")
            .custom(async (value) => {
                const purchase = await prisma.purchase.findUnique({ where: { id: Number(value) } });
                if (!purchase) return Promise.reject("La compra no existe");
            }),

        body("paymentMethodId")
            .isInt({ gt: 0 })
            .withMessage("paymentMethodId debe ser un entero positivo")
            .custom(async (value) => {
                const method = await prisma.paymentMethod.findUnique({ where: { id: Number(value) } });
                if (!method) return Promise.reject("El método de pago no existe");
            }),

        body("amount")
            .isFloat({ gt: 0 })
            .withMessage("amount debe ser un número mayor a 0"),

        body("currency")
            .optional()
            .trim()
            .isLength({ min: 1, max: 10 })
            .withMessage("currency debe tener entre 1 y 10 caracteres"),

        body("reference")
            .optional()
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage("reference debe tener entre 1 y 200 caracteres"),

        body("payment_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) throw new Error("payment_date debe ser una fecha válida (ISO)");
                return true;
            }),
    ];

    public updatePurchasePaymentValidator: ValidationChain[] = [
        body("purchaseId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("purchaseId debe ser un entero positivo")
            .custom(async (value) => {
                const purchase = await prisma.purchase.findUnique({ where: { id: Number(value) } });
                if (!purchase) return Promise.reject("La compra no existe");
            }),

        body("paymentMethodId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("paymentMethodId debe ser un entero positivo")
            .custom(async (value) => {
                const method = await prisma.paymentMethod.findUnique({ where: { id: Number(value) } });
                if (!method) return Promise.reject("El método de pago no existe");
            }),

        body("amount")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("amount debe ser un número mayor a 0"),

        body("currency")
            .optional()
            .trim()
            .isLength({ min: 1, max: 10 })
            .withMessage("currency debe tener entre 1 y 10 caracteres"),

        body("reference")
            .optional()
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage("reference debe tener entre 1 y 200 caracteres"),

        body("payment_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) throw new Error("payment_date debe ser una fecha válida (ISO)");
                return true;
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public PurchasePaymentExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const payment = await prisma.purchasePayment.findUnique({ where: { id: Number(value) } });
                if (!payment) return Promise.reject("El pago de compra no existe");
            }),
    ];
}
