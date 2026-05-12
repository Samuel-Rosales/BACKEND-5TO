import { body, ValidationChain } from "express-validator";

export class RegisterValidator {
    public validateRegister: ValidationChain[] = [
        body("ci")
            .trim()
            .notEmpty().withMessage("La cédula es requerida")
            .isString().withMessage("La cédula debe ser texto")
            .matches(/^\d{6,10}$/).withMessage("La cédula debe contener solo números (entre 6 y 10 dígitos)"),

        body("name")
            .trim()
            .notEmpty().withMessage("El nombre es requerido")
            .isString().withMessage("El nombre debe ser texto")
            .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres"),

        body("password")
            .notEmpty().withMessage("La contraseña es requerida")
            .isString().withMessage("La contraseña debe ser texto")
            .isLength({ min: 6, max: 200 }).withMessage("La contraseña debe tener entre 6 y 200 caracteres"),
    ];
}
