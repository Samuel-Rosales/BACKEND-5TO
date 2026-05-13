import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class AppointmentValidator {

    public createAppointmentValidator: ValidationChain[] = [
        body().custom((_, { req }) => {
            const hasDoctorId = req.body.doctorId !== undefined && req.body.doctorId !== null;
            const hasSpecialtyId = req.body.specialtyId !== undefined && req.body.specialtyId !== null;

            if (hasDoctorId === hasSpecialtyId) {
                throw new Error("Debe enviar exactamente uno: doctorId o specialtyId");
            }

            return true;
        }),

        body("doctorId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El doctorId debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor || !doctor.active) {
                    return Promise.reject("El doctor no existe o no está activo");
                }
            }),

        body("specialtyId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El specialtyId debe ser un número entero positivo")
            .custom(async (value) => {
                const specialty = await prisma.medicalSpecialty.findUnique({ where: { id: Number(value) } });

                if (!specialty || !specialty.active) {
                    return Promise.reject("La especialidad no existe o no está activa");
                }
            }),

        body("patientId")
            .isInt({ gt: 0 })
            .withMessage("El patientId debe ser un número entero positivo")
            .custom(async (value) => {
                const patient = await prisma.patient.findUnique({ where: { id: Number(value) } });

                if (!patient || !patient.active) {
                    return Promise.reject("El paciente no existe o no está activo");
                }
            }),

        body("statusId")
            .isInt({ gt: 0 })
            .withMessage("El statusId debe ser un número entero positivo")
            .custom(async (value) => {
                const status = await prisma.statusAppointment.findUnique({ where: { id: Number(value) } });

                if (!status) {
                    return Promise.reject("El estatus de cita no existe");
                }
            }),

        body("typeId")
            .isInt({ gt: 0 })
            .withMessage("El typeId debe ser un número entero positivo")
            .custom(async (value) => {
                const type = await prisma.appointmentType.findUnique({ where: { id: Number(value) } });

                if (!type) {
                    return Promise.reject("El tipo de cita no existe");
                }
            }),

        body("reson_visit")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("La razón de visita debe tener entre 1 y 5000 caracteres"),

        body("price")
            .isFloat({ gt: 0 })
            .withMessage("El precio debe ser un número mayor a 0"),

        body("date_time")
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("date_time debe ser una fecha válida (ISO)");
                }

                return true;
            }),
    ];

    public updateAppointmentValidator: ValidationChain[] = [
        body("doctorId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El doctorId debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor || !doctor.active) {
                    return Promise.reject("El doctor no existe o no está activo");
                }
            }),

        body("specialtyId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El specialtyId debe ser un número entero positivo")
            .custom(async (value) => {
                const specialty = await prisma.medicalSpecialty.findUnique({ where: { id: Number(value) } });

                if (!specialty || !specialty.active) {
                    return Promise.reject("La especialidad no existe o no está activa");
                }
            }),

        body("patientId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El patientId debe ser un número entero positivo")
            .custom(async (value) => {
                const patient = await prisma.patient.findUnique({ where: { id: Number(value) } });

                if (!patient || !patient.active) {
                    return Promise.reject("El paciente no existe o no está activo");
                }
            }),

        body("statusId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El statusId debe ser un número entero positivo")
            .custom(async (value) => {
                const status = await prisma.statusAppointment.findUnique({ where: { id: Number(value) } });

                if (!status) {
                    return Promise.reject("El estatus de cita no existe");
                }
            }),

        body("typeId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El typeId debe ser un número entero positivo")
            .custom(async (value) => {
                const type = await prisma.appointmentType.findUnique({ where: { id: Number(value) } });

                if (!type) {
                    return Promise.reject("El tipo de cita no existe");
                }
            }),

        body("reson_visit")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("La razón de visita debe tener entre 1 y 5000 caracteres"),

        body("price")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("El precio debe ser un número mayor a 0"),

        body("date_time")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("date_time debe ser una fecha válida (ISO)");
                }

                return true;
            }),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID de la cita debe ser un número entero positivo"),
    ];

    public AppointmentExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const appointment = await prisma.appointment.findUnique({ where: { id: Number(value) } });

                if (!appointment) {
                    return Promise.reject("La cita no existe");
                }
            }),
    ];
}
