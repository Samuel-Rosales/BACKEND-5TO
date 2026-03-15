import { prisma } from "@/configs";
import { body, ValidationChain } from "express-validator";

export class RoleValidator {

    public createRoleValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("El nombre debe tener entre 2 y 100 caracteres")
            .matches(/^[a-zA-Z0-9\s]+$/)
            .withMessage("El nombre del rol solo puede contener letras, números y espacios"),
            
        body("code")
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El código del rol debe tener entre 2 y 50 caracteres")
    ];

    public updateRoleValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("El nombre del rol debe tener entre 2 y 100 caracteres")
            .matches(/^[a-zA-Z0-9\s]+$/)
            .withMessage("El nombre del rol solo puede contener letras, números y espacios"),
        body("code")
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("El código del rol debe tener entre 2 y 50 caracteres")
    ];

    public IdParamValidator: ValidationChain[] = [
        body("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del rol debe ser un número entero positivo")
    ];

    public RoleExistsValidator: ValidationChain[] = [
        body("id")
            .custom(async (value) => {
                const role = await prisma.role.findUnique({ where: { id: Number(value) } });

                if (!role || !role.active) {
                    return Promise.reject("El rol no existe o no está activo");
                }
            })
    ];
}