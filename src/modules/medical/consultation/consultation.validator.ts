import { prisma } from "@/configs";
import { ConsultationStatus } from "@prisma/client";
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

        body("status")
            .optional()
            .isIn(["PENDING", "IN_PROGRESS", "FINISHED", "CANCELLED"])
            .withMessage("status inválido"),

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

    public finishConsultationValidator: ValidationChain[] = [
        body("finished_at")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("finished_at debe ser una fecha válida (ISO)");
                }

                return true;
            }),

        body("supplies")
            .exists()
            .withMessage("supplies es requerido")
            .isArray()
            .withMessage("supplies debe ser un arreglo"),

        body("supplies.*.supplyId")
            .if(body("supplies").exists())
            .isInt({ gt: 0 })
            .withMessage("supplies.*.supplyId debe ser un entero positivo")
            .custom(async (value) => {
                const supply = await prisma.supply.findUnique({ where: { id: Number(value) } });
                if (!supply) return Promise.reject("El insumo no existe");
            }),

        body("supplies.*.quantity")
            .if(body("supplies").exists())
            .isInt({ gt: 0 })
            .withMessage("supplies.*.quantity debe ser un entero mayor a 0"),

        body("prescriptions")
            .exists()
            .withMessage("prescriptions es requerido")
            .isArray()
            .withMessage("prescriptions debe ser un arreglo"),

        body("prescriptions.*.supplyId")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("prescriptions.*.supplyId debe ser un entero positivo")
            .custom(async (value) => {
                const supply = await prisma.supply.findUnique({ where: { id: Number(value) } });
                if (!supply) return Promise.reject("El insumo no existe");
            }),

        body("prescriptions.*.medication_name")
            .optional()
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage("prescriptions.*.medication_name debe tener entre 1 y 255 caracteres"),

        body("prescriptions.*.dosage")
            .optional()
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage("prescriptions.*.dosage debe tener entre 1 y 255 caracteres"),

        body("prescriptions.*.frequency")
            .optional()
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage("prescriptions.*.frequency debe tener entre 1 y 255 caracteres"),

        body("prescriptions.*.duration")
            .optional()
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage("prescriptions.*.duration debe tener entre 1 y 255 caracteres"),

        body("prescriptions.*.instructions")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("prescriptions.*.instructions debe tener entre 1 y 5000 caracteres"),

        body("prescriptions.*.active")
            .optional()
            .isBoolean()
            .withMessage("prescriptions.*.active debe ser boolean"),

        body("symptomsConsultas")
            .exists()
            .withMessage("symptomsConsultas es requerido")
            .isArray()
            .withMessage("symptomsConsultas debe ser un arreglo"),

        body("symptomsConsultas.*.symptomId")
            .if(body("symptomsConsultas").exists())
            .isInt({ gt: 0 })
            .withMessage("symptomsConsultas.*.symptomId debe ser un entero positivo")
            .custom(async (value) => {
                const symptom = await prisma.symptoms.findUnique({ where: { id: Number(value) } });
                if (!symptom) return Promise.reject("El síntoma no existe");
            }),

        body("symptomsConsultas.*.severity")
            .if(body("symptomsConsultas").exists())
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage("symptomsConsultas.*.severity debe tener entre 1 y 50 caracteres"),

        body("symptomsConsultas.*.duration")
            .if(body("symptomsConsultas").exists())
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("symptomsConsultas.*.duration debe tener entre 1 y 100 caracteres"),

        body("symptomsConsultas.*.notes")
            .optional()
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage("symptomsConsultas.*.notes debe tener entre 1 y 5000 caracteres"),

        body("clinicalExaminations")
            .exists()
            .withMessage("clinicalExaminations es requerido")
            .isArray()
            .withMessage("clinicalExaminations debe ser un arreglo"),

        body("clinicalExaminations.*.weight")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("clinicalExaminations.*.weight debe ser un número mayor a 0"),

        body("clinicalExaminations.*.height")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("clinicalExaminations.*.height debe ser un número mayor a 0"),

        body("clinicalExaminations.*.temperature")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("clinicalExaminations.*.temperature debe ser un número mayor a 0"),

        body("clinicalExaminations.*.systolic_bp")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("clinicalExaminations.*.systolic_bp debe ser un entero positivo"),

        body("clinicalExaminations.*.diastolic_bp")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("clinicalExaminations.*.diastolic_bp debe ser un entero positivo"),

        body("clinicalExaminations.*.heart_rate")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("clinicalExaminations.*.heart_rate debe ser un entero positivo"),

        body("clinicalExaminations.*.respiratory_rate")
            .optional()
            .isInt({ gt: 0 })
            .withMessage("clinicalExaminations.*.respiratory_rate debe ser un entero positivo"),

        body("clinicalExaminations.*.oxygen_saturation")
            .optional()
            .isFloat({ gt: 0 })
            .withMessage("clinicalExaminations.*.oxygen_saturation debe ser un número mayor a 0"),

        body("consultationDiagnoses")
            .exists()
            .withMessage("consultationDiagnoses es requerido")
            .isArray()
            .withMessage("consultationDiagnoses debe ser un arreglo"),

        body("consultationDiagnoses")
            .custom((value) => {
                if (!Array.isArray(value)) return true;
                const primaryCount = value.filter((d) => d && d.is_primary === true).length;
                if (primaryCount > 1) {
                    throw new Error("Solo puede existir un diagnóstico primario");
                }
                return true;
            }),

        body("consultationDiagnoses.*.diagnosisId")
            .if(body("consultationDiagnoses").exists())
            .isInt({ gt: 0 })
            .withMessage("consultationDiagnoses.*.diagnosisId debe ser un entero positivo")
            .custom(async (value) => {
                const diagnosis = await prisma.diagnosis.findUnique({ where: { id: Number(value) } });
                if (!diagnosis) return Promise.reject("El diagnóstico no existe");
            }),

        body("consultationDiagnoses.*.is_primary")
            .if(body("consultationDiagnoses").exists())
            .isBoolean()
            .withMessage("consultationDiagnoses.*.is_primary debe ser boolean"),

        body("consultationDiagnoses.*.condition_status")
            .optional()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage("consultationDiagnoses.*.condition_status debe tener entre 1 y 50 caracteres"),

        body("consultationDiagnoses.*.onset_date")
            .optional()
            .custom((value) => {
                if (!isValidDateString(value)) {
                    throw new Error("consultationDiagnoses.*.onset_date debe ser una fecha válida (ISO)");
                }
                return true;
            }),
    ];

    public startConsultationValidator: ValidationChain[] = [
        param("id")
            .custom(async (value) => {
                const consultation = await prisma.consultation.findUnique({
                    where: { id: Number(value) },
                    select: { status: true },
                });

                if (!consultation) {
                    return Promise.reject("La consulta no existe");
                }

                if (consultation.status !== ConsultationStatus.PENDING) {
                    return Promise.reject("La consulta no está pendiente");
                }
            }),
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

    finAllByDoctorValidator: ValidationChain[] = [
        param("id")
            .isInt({ gt: 0 })
            .withMessage("El ID del doctor debe ser un número entero positivo")
            .custom(async (value) => {
                const doctor = await prisma.doctor.findUnique({ where: { id: Number(value) } });
                if (!doctor) {
                    return Promise.reject("El doctor no existe");
                }

            }),

        
    ];
}
