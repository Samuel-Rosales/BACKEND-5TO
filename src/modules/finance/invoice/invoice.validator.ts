import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class InvoiceValidator {

    public createInvoiceValidator: ValidationChain[] = [
        body("patientId")
            .isInt({ gt: 0 })
            .withMessage("patientId debe ser un entero positivo")
            .custom(async (value) => {
                const patient = await prisma.patient.findUnique({ where: { id: Number(value) } });
                if (!patient) {
                    return Promise.reject("El paciente no existe");
                }
            }),

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

        body("statusId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("statusId debe ser un entero positivo")
            .custom(async (value) => {
                const status = await prisma.statusInvoice.findUnique({ where: { id: Number(value) } });
                if (!status) {
                    return Promise.reject("El status de la factura no existe");
                }
            }),

        body("details")
            .optional()
            .isArray({ min: 1 })
            .withMessage("details debe ser un arreglo con al menos 1 elemento"),

        body("details.*.productId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("productId debe ser un entero positivo")
            .custom(async (value) => {
                const supply = await prisma.supply.findUnique({ where: { id: Number(value) } });
                if (!supply) {
                    return Promise.reject("El insumo no existe");
                }
            }),

        body("details.*.description")
            .if(body("details").exists())
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("description debe tener entre 1 y 5000 caracteres"),

        body("details.*.quantity")
            .if(body("details").exists())
            .isInt({ gt: 0 })
            .withMessage("quantity debe ser un entero mayor a 0"),

        body("details.*.unit_price")
            .if(body("details").exists())
            .isFloat({ gt: 0 })
            .withMessage("unit_price debe ser un número mayor a 0"),

        body("details.*.taxId")
            .if(body("details").exists())
            .isInt({ gt: 0 })
            .withMessage("taxId debe ser un entero positivo")
            .custom(async (value) => {
                const tax = await prisma.tax.findUnique({ where: { id: Number(value) } });
                if (!tax) {
                    return Promise.reject("El impuesto no existe");
                }
            }),

        body("details.*.is_commissionable")
            .optional()
            .isBoolean()
            .withMessage("is_commissionable debe ser boolean"),
    ];

    public updateInvoiceValidator: ValidationChain[] = [
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

        body("statusId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("statusId debe ser un entero positivo")
            .custom(async (value) => {
                const status = await prisma.statusInvoice.findUnique({ where: { id: Number(value) } });
                if (!status) {
                    return Promise.reject("El status de la factura no existe");
                }
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public InvoiceExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const invoice = await prisma.invoice.findUnique({ where: { id: Number(value) } });
                if (!invoice) {
                    return Promise.reject("La factura no existe");
                }
            }),
    ];
}
