import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class PaymentMethodValidator {

    public createPaymentMethodValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

        body("type")
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El type debe tener entre 2 y 50 caracteres"),

        body("currency")
            .trim()
            .isLength({ min: 2, max: 10 })
            .withMessage("La currency debe tener entre 2 y 10 caracteres"),

        body("is_active")
            .optional()
            .isBoolean()
            .withMessage("is_active debe ser boolean"),
    ];

    public updatePaymentMethodValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

        body("type")
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El type debe tener entre 2 y 50 caracteres"),

        body("currency")
            .optional()
            .trim()
            .isLength({ min: 2, max: 10 })
            .withMessage("La currency debe tener entre 2 y 10 caracteres"),

        body("is_active")
            .optional()
            .isBoolean()
            .withMessage("is_active debe ser boolean"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un entero positivo"),
    ];

    public PaymentMethodExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const method = await prisma.paymentMethod.findUnique({ where: { id: Number(value) } });

                if (!method) {
                    return Promise.reject("El método de pago no existe");
                }
            }),
    ];
}
