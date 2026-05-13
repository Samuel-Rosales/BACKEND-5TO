import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class SupplierValidator {

    public createSupplierValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 150 })
            .withMessage("El nombre debe tener entre 2 y 150 caracteres"),

        body("contact")
            .optional()
            .trim()
            .isLength({ min: 1, max: 150 })
            .withMessage("El contacto debe tener entre 1 y 150 caracteres"),

        body("phone")
            .optional()
            .trim()
            .isLength({ min: 1, max: 30 })
            .withMessage("El teléfono debe tener entre 1 y 30 caracteres"),
    ];

    public updateSupplierValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 150 })
            .withMessage("El nombre debe tener entre 2 y 150 caracteres"),

        body("contact")
            .optional()
            .trim()
            .isLength({ min: 1, max: 150 })
            .withMessage("El contacto debe tener entre 1 y 150 caracteres"),

        body("phone")
            .optional()
            .trim()
            .isLength({ min: 1, max: 30 })
            .withMessage("El teléfono debe tener entre 1 y 30 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public SupplierExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const supplier = await prisma.supplier.findUnique({ where: { id: Number(value) } });
                if (!supplier) {
                    return Promise.reject("El proveedor no existe");
                }
            }),
    ];
}
