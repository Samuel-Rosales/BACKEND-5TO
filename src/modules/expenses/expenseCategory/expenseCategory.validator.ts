import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class ExpenseCategoryValidator {

    public createExpenseCategoryValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),
    ];

    public updateExpenseCategoryValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage("El nombre debe tener entre 2 y 120 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID de la categoría de gasto debe ser un número entero positivo"),
    ];

    public ExpenseCategoryExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const category = await prisma.expenseCategory.findUnique({ where: { id: Number(value) } });

                if (!category) {
                    return Promise.reject("La categoría de gasto no existe");
                }
            }),
    ];
}
