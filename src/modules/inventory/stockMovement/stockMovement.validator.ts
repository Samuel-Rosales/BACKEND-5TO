import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class StockMovementValidator {

    public createStockMovementValidator: ValidationChain[] = [
        body("supplyId")
            .isInt({ gt: 0 })
            .withMessage("El supplyId debe ser un número entero positivo")
            .custom(async (value, { req }) => {
                const supplyId = Number(value);
                const stockLotId = Number(req.body.stockLotId);

                const product = await prisma.supply.findUnique({ where: { id: supplyId } });

                if (!product || !product.active) {
                    return Promise.reject("El producto no existe o no está activo");
                }

                if (Number.isFinite(stockLotId) && stockLotId > 0) {
                    const lot = await prisma.stockLot.findUnique({ where: { id: stockLotId } });

                    if (lot && lot.supplyId !== supplyId) {
                        return Promise.reject("El stockLotId no pertenece al supplyId indicado");
                    }
                }
            }),

        body("stockLotId")
            .isInt({ gt: 0 })
            .withMessage("El stockLotId debe ser un número entero positivo")
            .custom(async (value) => {
                const lot = await prisma.stockLot.findUnique({ where: { id: Number(value) } });

                if (!lot) {
                    return Promise.reject("El lote no existe");
                }
            }),

        body("userId")
            .isInt({ gt: 0 })
            .withMessage("El userId debe ser un número entero positivo")
            .custom(async (value) => {
                const user = await prisma.user.findUnique({ where: { id: Number(value) } });

                if (!user || !user.active) {
                    return Promise.reject("El usuario no existe o no está activo");
                }
            }),

        body("type")
            .isIn(["IN", "OUT"])
            .withMessage("type debe ser 'IN' o 'OUT'"),

        body("quantity")
            .isInt({ gt: 0 })
            .withMessage("quantity debe ser un entero mayor a 0"),

        body("reason")
            .optional()
            .trim()
            .isLength({ min: 1, max: 500 })
            .withMessage("reason debe tener entre 1 y 500 caracteres"),

        body("date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("date debe ser una fecha válida (ISO)");
                }

                return true;
            }),
    ];

    public updateStockMovementValidator: ValidationChain[] = [
        body("supplyId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El supplyId debe ser un número entero positivo")
            .custom(async (value, { req }) => {
                const supplyId = Number(value);
                const stockLotId = req.body.stockLotId !== undefined ? Number(req.body.stockLotId) : NaN;

                const product = await prisma.supply.findUnique({ where: { id: supplyId } });

                if (!product || !product.active) {
                    return Promise.reject("El producto no existe o no está activo");
                }

                if (Number.isFinite(stockLotId) && stockLotId > 0) {
                    const lot = await prisma.stockLot.findUnique({ where: { id: stockLotId } });

                    if (lot && lot.supplyId !== supplyId) {
                        return Promise.reject("El stockLotId no pertenece al supplyId indicado");
                    }
                }
            }),

        body("stockLotId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El stockLotId debe ser un número entero positivo")
            .custom(async (value) => {
                const lot = await prisma.stockLot.findUnique({ where: { id: Number(value) } });

                if (!lot) {
                    return Promise.reject("El lote no existe");
                }
            }),

        body("userId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El userId debe ser un número entero positivo")
            .custom(async (value) => {
                const user = await prisma.user.findUnique({ where: { id: Number(value) } });

                if (!user || !user.active) {
                    return Promise.reject("El usuario no existe o no está activo");
                }
            }),

        body("type")
            .optional()
            .isIn(["IN", "OUT"])
            .withMessage("type debe ser 'IN' o 'OUT'"),

        body("quantity")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("quantity debe ser un entero mayor a 0"),

        body("reason")
            .optional()
            .trim()
            .isLength({ min: 1, max: 500 })
            .withMessage("reason debe tener entre 1 y 500 caracteres"),

        body("date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("date debe ser una fecha válida (ISO)");
                }

                return true;
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del movimiento debe ser un número entero positivo"),
    ];

    public StockMovementExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const movement = await prisma.stockMovement.findUnique({ where: { id: Number(value) } });

                if (!movement) {
                    return Promise.reject("El movimiento no existe");
                }
            }),
    ];
}
