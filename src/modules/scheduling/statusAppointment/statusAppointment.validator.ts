import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class StatusAppointmentValidator {

    public createStatusAppointmentValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 80 })
            .withMessage("El nombre debe tener entre 2 y 80 caracteres"),

        body("color_hex")
            .optional()
            .trim()
            .matches(/^#([A-Fa-f0-9]{6})$/)
            .withMessage("El color debe ser un HEX válido (ej: #FFAA00)"),
    ];

    public updateStatusAppointmentValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 80 })
            .withMessage("El nombre debe tener entre 2 y 80 caracteres"),

        body("color_hex")
            .optional()
            .trim()
            .matches(/^#([A-Fa-f0-9]{6})$/)
            .withMessage("El color debe ser un HEX válido (ej: #FFAA00)"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un número entero positivo"),
    ];

    public StatusAppointmentExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const statusAppointment = await prisma.statusAppointment.findUnique({ where: { id: Number(value) } });

                if (!statusAppointment) {
                    return Promise.reject("El estatus de cita no existe");
                }
            }),
    ];
}
