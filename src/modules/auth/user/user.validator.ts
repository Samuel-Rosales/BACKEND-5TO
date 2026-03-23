import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class UserValidator {

    public createUserValidator: ValidationChain[] = [
        body("ci")
            .trim()
            .isLength({ min: 6, max: 9 })
            .withMessage("La cédula debe tener entre 6 y 9 numeros")
            .matches(/^[0-9]+$/)
            .withMessage("La cédula solo puede contener números"),

        body("name")
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

        body("password")
            .isLength({ min: 6, max: 200 })
            .withMessage("La contraseña debe tener entre 6 y 200 caracteres"),

        body("roleId")
            .isInt({ gt: 0 })
            .withMessage("El roleId debe ser un número entero positivo")
            .custom(async (value) => {
                const role = await prisma.role.findUnique({ where: { id: Number(value), active: true } });

                if (!role) {
                    return Promise.reject("El rol no existe o no está activo");
                }
            }),
    ];

    public updateUserValidator: ValidationChain[] = [
        body("ci")
            .optional()
            .trim()
            .isLength({ min: 6, max: 9 })
            .withMessage("La cédula debe tener entre 6 y 9 numeros")
            .matches(/^[0-9]+$/)
            .withMessage("La cédula solo puede contener números"),

        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

        body("password")
            .optional()
            .isLength({ min: 6, max: 200 })
            .withMessage("La contraseña debe tener entre 6 y 200 caracteres"),

        body("roleId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El roleId debe ser un número entero positivo")
            .custom(async (value) => {
                const role = await prisma.role.findUnique({ where: { id: Number(value), active: true } });

                if (!role) {
                    return Promise.reject("El rol no existe o no está activo");
                }
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del usuario debe ser un número entero positivo"),
    ];

    public UserExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const user = await prisma.user.findUnique({ where: { id: Number(value) } });

                if (!user || !user.active) {
                    return Promise.reject("El usuario no existe o no está activo");
                }
            }),
    ];
}
