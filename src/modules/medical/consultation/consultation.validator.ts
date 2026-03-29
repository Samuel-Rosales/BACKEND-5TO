import { prisma } from "@/configs";
import { body, param, ValidationChain } from "express-validator";

const isValidDateString = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

export class ConsultationValidator {

    public createConsultationValidator: ValidationChain[] = [
        body("invoiceId")
            .isInt({ gt: 0 })
            .withMessage("El invoiceId debe ser un número entero positivo")
            .custom(async (value) => {
                const invoice = await prisma.invoice.findUnique({ where: { id: Number(value) } });

                if (!invoice) {
                    return Promise.reject("La factura no existe");
                }
            }),

        body("doctorId")
            .isInt({ gt: 0 })
            .withMessage("El doctorId debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor) {
                    return Promise.reject("El doctor no existe");
                }
            })
    ];

    public updateConsultationValidator: ValidationChain[] = [
        body("appointmentId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El appointmentId debe ser un número entero positivo")
            .custom(async (value) => {
                const appointment = await prisma.appointment.findUnique({ where: { id: Number(value) } });

                if (!appointment) {
                    return Promise.reject("La cita no existe");
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

        body("doctorId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("El doctorId debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });

                if (!doctor) {
                    return Promise.reject("El doctor no existe");
                }
            }),

        body("date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("La fecha debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("started_at")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("started_at debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("finished_at")
            .optional()
            .custom((value, { req }) => {
                if (!isValidDateString(value)) {
                    throw new Error("finished_at debe ser una fecha válida (ISO)");
                }

                const startedCandidate = req.body.started_at;

                if (isValidDateString(startedCandidate)) {
                    const started = new Date(startedCandidate);
                    const finished = new Date(value);

                    if (finished < started) {
                        throw new Error("finished_at no puede ser menor que started_at");
                    }
                }

                return true;
            }),

        body("symptoms")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("Los síntomas deben tener entre 1 y 5000 caracteres"),

        body("diagnosis")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("El diagnóstico debe tener entre 1 y 5000 caracteres"),

        body("physical_exam")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("El examen físico debe tener entre 1 y 5000 caracteres"),
    ];

    public IdParamValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID de la consulta debe ser un número entero positivo"),
    ];

    public ConsultationExistsValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const consultation = await prisma.consultation.findUnique({ where: { id: Number(value) } });

                if (!consultation) {
                    return Promise.reject("La consulta no existe");
                }
            }),
    ];
}
