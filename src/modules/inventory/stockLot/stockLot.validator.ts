import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class StockLotValidator {

    public createStockLotValidator: ValidationChain[] = [
        body("quantity")
            .isInt({ gt: 0 })
            .withMessage("quantity debe ser un entero mayor a 0"),

        body("supplyId")
            .isInt({ gt: 0 })
            .withMessage("El supplyId debe ser un número entero positivo")
            .custom(async (value) => {
                const product = await prisma.supply.findUnique({ where: { id: Number(value) } });

                if (!product || !product.active) {
                    return Promise.reject("El producto no existe o no está activo");
                }
            }),

        body("expiration_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("expiration_date debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("lot_cost")
            .isFloat({ gt: 0 })
            .withMessage("lot_cost debe ser un número mayor a 0"),
    ];

    public updateStockLotValidator: ValidationChain[] = [
        body("quantity")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("quantity debe ser un entero mayor a 0"),

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

        body("expiration_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("expiration_date debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("lot_cost")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("lot_cost debe ser un número mayor a 0"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del lote debe ser un número entero positivo"),
    ];

    public StockLotExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const lot = await prisma.stockLot.findUnique({ where: { id: Number(value) } });

                if (!lot) {
                    return Promise.reject("El lote no existe");
                }
            }),
    ];
}
