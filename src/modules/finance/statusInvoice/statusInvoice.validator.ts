import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class StatusInvoiceValidator {

    public createStatusInvoiceValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 80 })
            .withMessage("El nombre debe tener entre 2 y 80 caracteres"),

        body("color_hex")
            .optional()
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage("color_hex debe tener entre 3 y 20 caracteres"),
    ];

    public updateStatusInvoiceValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 80 })
            .withMessage("El nombre debe tener entre 2 y 80 caracteres"),

        body("color_hex")
            .optional()
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage("color_hex debe tener entre 3 y 20 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public StatusInvoiceExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const status = await prisma.statusInvoice.findUnique({ where: { id: Number(value) } });

                if (!status) {
                    return Promise.reject("El status de factura no existe");
                }
            }),
    ];
}
