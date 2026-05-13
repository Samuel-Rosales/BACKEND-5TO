import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class AppointmentTypeValidator {

    public createAppointmentTypeValidator: ValidationChain[] = [
        body("name")
            .trim()
            .isLength({ min: 2, max: 80 })
            .withMessage("El nombre debe tener entre 2 y 80 caracteres"),
    ];

    public updateAppointmentTypeValidator: ValidationChain[] = [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 80 })
            .withMessage("El nombre debe tener entre 2 y 80 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID debe ser un número entero positivo"),
    ];

    public AppointmentTypeExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const type = await prisma.appointmentType.findUnique({ where: { id: Number(value) } });

                if (!type) {
                    return Promise.reject("El tipo de cita no existe");
                }
            }),
    ];
}
