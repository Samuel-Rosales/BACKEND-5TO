import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

export class DoctorValidator {

    public createDoctorValidator: ValidationChain[] = [
        body("userId")
            .isInt({ gt: 0 })
            .withMessage("El userId debe ser un número entero positivo")
            .custom(async (value) => {
                const userId = Number(value);

                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (!user || !user.active) {
                    return Promise.reject("El usuario no existe o no está activo");
                }

                const existingDoctor = await prisma.doctor.findUnique({ where: { userId } });

                if (existingDoctor) {
                    return Promise.reject("Ya existe un doctor asociado a este usuario");
                }
            }),

        body("specialtyId")
            .isInt({ gt: 0 })
            .withMessage("El specialtyId debe ser un número entero positivo")
            .custom(async (value) => {
                const specialty = await prisma.medicalSpecialty.findUnique({ where: { id: Number(value) } });

                if (!specialty) {
                    return Promise.reject("La especialidad médica no existe");
                }
            }),
    ];

    public updateDoctorValidator: ValidationChain[] = [
        body("userId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El userId debe ser un número entero positivo")
            .custom(async (value, { req }) => {
                const userId = Number(value);
                const doctorId = Number(req.params?.id);

                if (!Number.isFinite(doctorId)) {
                    return Promise.reject("ID del doctor inválido");
                }

                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (!user || !user.active) {
                    return Promise.reject("El usuario no existe o no está activo");
                }

                const existingDoctor = await prisma.doctor.findUnique({ where: { userId } });

                if (existingDoctor && existingDoctor.id !== doctorId) {
                    return Promise.reject("Ya existe un doctor asociado a este usuario");
                }
            }),

        body("specialtyId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El specialtyId debe ser un número entero positivo")
            .custom(async (value) => {
                const specialty = await prisma.medicalSpecialty.findUnique({ where: { id: Number(value) } });

                if (!specialty) {
                    return Promise.reject("La especialidad médica no existe");
                }
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del doctor debe ser un número entero positivo"),
    ];

    public DoctorExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor) {
                    return Promise.reject("El doctor no existe");
                }
            }),
    ];
}
