import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
};

export class PurchaseValidator {

    public createPurchaseValidator: ValidationChain[] = [
        body("supplierId")
            .isInt({ gt: 0 })
            .withMessage("supplierId debe ser un entero positivo")
            .custom(async (value) => {
                const supplier = await prisma.supplier.findUnique({ where: { id: Number(value) } });
                if (!supplier) return Promise.reject("El proveedor no existe");
            }),

        body("userId")
            .isInt({ gt: 0 })
            .withMessage("userId debe ser un entero positivo")
            .custom(async (value) => {
                const user = await prisma.user.findUnique({ where: { id: Number(value) } });
                if (!user) return Promise.reject("El usuario no existe");
            }),

        body("exchangeRateId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("exchangeRateId debe ser un entero positivo")
            .custom(async (value) => {
                const rate = await prisma.exchangeRate.findUnique({ where: { id: Number(value) } });
                if (!rate) return Promise.reject("La tasa de cambio no existe");
            }),

        body("status")
            .optional()
            .trim()
            .isLength({ min: 2, max: 80 })
            .withMessage("status debe tener entre 2 y 80 caracteres"),

        body("reference")
            .optional()
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage("reference debe tener entre 1 y 200 caracteres"),

        body("observation")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("observation debe tener entre 1 y 5000 caracteres"),

        body("discount")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("discount debe ser un número mayor o igual a 0"),

        body("items")
            .isArray({ min: 1 })
            .withMessage("items debe ser un arreglo con al menos 1 elemento"),

        body("items.*.supplyId")
            .isInt({ gt: 0 })
            .withMessage("supplyId debe ser un entero positivo")
            .custom(async (value) => {
                const supply = await prisma.supply.findUnique({ where: { id: Number(value) } });
                if (!supply || !supply.active) return Promise.reject("El insumo no existe o no está activo");
            }),

        body("items.*.quantity")
            .isInt({ gt: 0 })
            .withMessage("quantity debe ser un entero mayor a 0"),

        body("items.*.unit_cost")
            .isFloat({ gt: 0 })
            .withMessage("unit_cost debe ser un número mayor a 0"),

        body("items.*.expiration_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) throw new Error("expiration_date debe ser una fecha válida (ISO)");
                return true;
            }),
    ];

    public updatePurchaseValidator: ValidationChain[] = [
        body("supplierId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("supplierId debe ser un entero positivo")
            .custom(async (value) => {
                const supplier = await prisma.supplier.findUnique({ where: { id: Number(value) } });
                if (!supplier) return Promise.reject("El proveedor no existe");
            }),

        body("userId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("userId debe ser un entero positivo")
            .custom(async (value) => {
                const user = await prisma.user.findUnique({ where: { id: Number(value) } });
                if (!user) return Promise.reject("El usuario no existe");
            }),

        body("exchangeRateId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("exchangeRateId debe ser un entero positivo")
            .custom(async (value) => {
                const rate = await prisma.exchangeRate.findUnique({ where: { id: Number(value) } });
                if (!rate) return Promise.reject("La tasa de cambio no existe");
            }),

        body("status")
            .optional()
            .trim()
            .isLength({ min: 2, max: 80 })
            .withMessage("status debe tener entre 2 y 80 caracteres"),

        body("reference")
            .optional()
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage("reference debe tener entre 1 y 200 caracteres"),

        body("observation")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("observation debe tener entre 1 y 5000 caracteres"),

        body("discount")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("discount debe ser un número mayor o igual a 0"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public PurchaseExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const purchase = await prisma.purchase.findUnique({ where: { id: Number(value) } });
                if (!purchase) return Promise.reject("La compra no existe");
            }),
    ];
}
