import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class SupplyConsultationValidator {

    public createSupplyConsultationValidator: ValidationChain[] = [
        body("supplyId")
            .isInt({ gt: 0 })
            .withMessage("El supplyId debe ser un número entero positivo")
            .custom(async (value) => {
                const product = await prisma.supply.findUnique({ where: { id: Number(value) } });

                if (!product || !product.active) {
                    return Promise.reject("El producto no existe o no está activo");
                }
            }),

        body("consultationId")
            .isInt({ gt: 0 })
            .withMessage("El consultationId debe ser un número entero positivo")
            .custom(async (value) => {
                const consultation = await prisma.consultation.findUnique({ where: { id: Number(value) } });

                if (!consultation) {
                    return Promise.reject("La consulta no existe");
                }
            }),

        body("quantity")
            .isFloat({ gt: 0 })
            .withMessage("quantity debe ser un número mayor a 0"),
    ];

    public updateSupplyConsultationValidator: ValidationChain[] = [
        body("supplyId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El supplyId debe ser un número entero positivo")
            .custom(async (value) => {
                const product = await prisma.supply.findUnique({ where: { id: Number(value) } });

                if (!product || !product.active) {
                    return Promise.reject("El producto no existe o no está activo");
                }
            }),

        body("consultationId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El consultationId debe ser un número entero positivo")
            .custom(async (value) => {
                const consultation = await prisma.consultation.findUnique({ where: { id: Number(value) } });

                if (!consultation) {
                    return Promise.reject("La consulta no existe");
                }
            }),

        body("quantity")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("quantity debe ser un número mayor a 0"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del suministro debe ser un número entero positivo"),
    ];

    public SupplyConsultationExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const supply = await prisma.supplyConsultation.findUnique({ where: { id: Number(value) } });

                if (!supply) {
                    return Promise.reject("El suministro no existe");
                }
            }),
    ];
}
