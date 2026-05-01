import {
    ensureAppointment,
    ensureAppointmentType,
    ensureDiagnosis,
    ensureDoctor,
    ensureInfoPatient,
    ensureMedicalSpecialty,
    ensurePatient,
    ensureStatusAppointment,
    ensureSymptom,
    prisma,
} from "./shared";

type ClinicalSeedDeps = {
    users: {
        doctor1: number;
        doctor2: number;
        doctor3: number;
        reception: number;
        patient: number;
    };
    finance: {
        invoiceStatuses: {
            proforma: number;
            paid: number;
        };
        taxId: number;
        exchangeRates: {
            active: number;
        };
        paymentMethods: {
            cashUsd: number;
            transferBs: number;
            zelleUsd: number;
        };
    };
    inventory: {
        products: {
            guantes: number;
            jeringa: number;
            paracetamol: number;
            algodon: number;
            alcohol: number;
            ibuprofeno: number;
            amoxicilina: number;
            lapiz: number;
        };
    };
};

type ConsultationBundleInput = {
    doctorId: number;
    patientId: number;
    receptionistId: number;
    statusInvoiceId: number;
    taxId: number;
    exchangeRateId: number;
    paymentMethodId: number;
    invoiceTotalUsd: number;
    startedAt: Date;
    finishedAt: Date;
    symptoms: Array<{ symptomId: number; severity: string; duration: string; notes?: string }>;
    diagnoses: Array<{ diagnosisId: number; isPrimary: boolean; conditionStatus?: string; onsetDate?: Date }>;
    supplyConsumptions: Array<{ supplyId: number; quantity: number }>;
    prescriptions: Array<{
        supplyId?: number;
        medication_name: string;
        dosage?: string;
        frequency?: string;
        duration?: string;
        instructions?: string;
    }>;
    exam: {
        weight?: number;
        height?: number;
        temperature?: number;
        systolic_bp?: number;
        diastolic_bp?: number;
        heart_rate?: number;
        respiratory_rate?: number;
        oxygen_saturation?: number;
    };
    igtfAmount?: number;
};

async function ensureConsultationBundle(input: ConsultationBundleInput) {
    const existing = await prisma.consultation.findFirst({
        where: {
            doctorId: input.doctorId,
            started_at: input.startedAt,
        },
        select: { id: true, invoiceId: true },
    });

    if (existing) {
        return existing;
    }

    return prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.create({
            data: {
                patientId: input.patientId,
                receptionistId: input.receptionistId,
                exchangeRateId: input.exchangeRateId,
                statusId: input.statusInvoiceId,
                taxId: input.taxId,
                total_usd: input.invoiceTotalUsd,
            },
            select: { id: true },
        });

        const consultation = await tx.consultation.create({
            data: {
                doctorId: input.doctorId,
                invoiceId: invoice.id,
                date: input.startedAt,
                started_at: input.startedAt,
                finished_at: input.finishedAt,
            },
            select: { id: true, invoiceId: true },
        });

        for (const symptom of input.symptoms) {
            const existingSymptom = await tx.symptomsConsultation.findFirst({
                where: {
                    consultation_id: consultation.id,
                    symptoms_id: symptom.symptomId,
                    severity: symptom.severity,
                },
                select: { id: true },
            });

            if (!existingSymptom) {
                await tx.symptomsConsultation.create({
                    data: {
                        consultation_id: consultation.id,
                        symptoms_id: symptom.symptomId,
                        severity: symptom.severity,
                        duration: symptom.duration,
                        notes: symptom.notes,
                    },
                });
            }
        }

        for (const diagnosis of input.diagnoses) {
            const existingDiagnosis = await tx.consultationDiagnosis.findFirst({
                where: {
                    consultation_id: consultation.id,
                    diagnosisId: diagnosis.diagnosisId,
                },
                select: { id: true },
            });

            if (!existingDiagnosis) {
                await tx.consultationDiagnosis.create({
                    data: {
                        consultation_id: consultation.id,
                        diagnosisId: diagnosis.diagnosisId,
                        is_primary: diagnosis.isPrimary,
                        condition_status: diagnosis.conditionStatus,
                        onset_date: diagnosis.onsetDate,
                    },
                });
            }
        }

        const existingExam = await tx.clinicalExamination.findFirst({
            where: { consultation_id: consultation.id },
            select: { id: true },
        });

        if (!existingExam) {
            await tx.clinicalExamination.create({
                data: {
                    consultation_id: consultation.id,
                    weight: input.exam.weight,
                    height: input.exam.height,
                    temperature: input.exam.temperature,
                    systolic_bp: input.exam.systolic_bp,
                    diastolic_bp: input.exam.diastolic_bp,
                    heart_rate: input.exam.heart_rate,
                    respiratory_rate: input.exam.respiratory_rate,
                    oxygen_saturation: input.exam.oxygen_saturation,
                },
            });
        }

        for (const supply of input.supplyConsumptions) {
            const existingSupply = await tx.supplyConsultation.findFirst({
                where: {
                    consultationId: consultation.id,
                    supplyId: supply.supplyId,
                },
                select: { id: true },
            });

            if (!existingSupply) {
                await tx.supplyConsultation.create({
                    data: {
                        consultationId: consultation.id,
                        supplyId: supply.supplyId,
                        quantity: supply.quantity,
                    },
                });
            }
        }

        for (const prescription of input.prescriptions) {
            const existingPrescription = await tx.prescription.findFirst({
                where: {
                    consultationId: consultation.id,
                    medication_name: prescription.medication_name,
                },
                select: { id: true },
            });

            if (!existingPrescription) {
                await tx.prescription.create({
                    data: {
                        consultationId: consultation.id,
                        supplyId: prescription.supplyId,
                        medication_name: prescription.medication_name,
                        dosage: prescription.dosage,
                        frequency: prescription.frequency,
                        duration: prescription.duration,
                        instructions: prescription.instructions,
                        active: true,
                    },
                });
            }
        }

        const existingPayment = await tx.invoicePayment.findFirst({
            where: {
                invoiceId: invoice.id,
                paymentMethodId: input.paymentMethodId,
                amount_paid: input.invoiceTotalUsd,
            },
            select: { id: true },
        });

        if (!existingPayment) {
            await tx.invoicePayment.create({
                data: {
                    invoiceId: invoice.id,
                    paymentMethodId: input.paymentMethodId,
                    exchangeRateId: input.exchangeRateId,
                    amount_paid: input.invoiceTotalUsd,
                    igtf_amount: input.igtfAmount ?? 0,
                    date_at: input.finishedAt,
                },
            });
        }

        return consultation;
    });
}

export async function seedClinical(deps: ClinicalSeedDeps) {
    const specialtyGeneral = await ensureMedicalSpecialty({ name: "Medicina General", consultation_price: 20, commission_percentage: 30 });
    const specialtyPediatrics = await ensureMedicalSpecialty({ name: "Pediatría", consultation_price: 25, commission_percentage: 30 });
    const specialtyCardiology = await ensureMedicalSpecialty({ name: "Cardiología", consultation_price: 50, commission_percentage: 25 });
    const specialtyTrauma = await ensureMedicalSpecialty({ name: "Traumatología", consultation_price: 35, commission_percentage: 28 });

    const doctor1 = await ensureDoctor({ userId: deps.users.doctor1, specialtyId: specialtyGeneral.id });
    const doctor2 = await ensureDoctor({ userId: deps.users.doctor2, specialtyId: specialtyPediatrics.id });
    const doctor3 = await ensureDoctor({ userId: deps.users.doctor3, specialtyId: specialtyCardiology.id });
    void specialtyTrauma;

    const patient1 = await ensurePatient({ userId: deps.users.patient, ci: "70000001", name: "Paciente Demo" });
    const patient2 = await ensurePatient({ userId: deps.users.patient, ci: "70000002", name: "Paciente Demo 2" });
    const patient3 = await ensurePatient({ userId: deps.users.patient, ci: "70000003", name: "Paciente Demo 3" });
    const patient4 = await ensurePatient({ userId: deps.users.patient, ci: "70000004", name: "Paciente Demo 4" });
    const patient5 = await ensurePatient({ userId: deps.users.patient, ci: "70000005", name: "Paciente Demo 5" });
    const patient6 = await ensurePatient({ userId: deps.users.patient, ci: "70000006", name: "Paciente Demo 6" });

    const patients = [patient1, patient2, patient3, patient4, patient5, patient6];

    const patientProfiles = [
        {
            patientId: patient1.id,
            ci: "70000001",
            name: "Paciente",
            last_name: "Demo",
            sex: "FEMALE" as const,
            birth_date: new Date("1995-01-10"),
            blood_type: "O+",
            nacionality: "Venezolana",
            profession: "Docente",
            main_phone: "0414-0000001",
            email: "paciente.demo@example.com",
            address: "Av. Siempre Viva 123",
            city: "Caracas",
            allergies: "SEED: sin alergias conocidas",
        },
        {
            patientId: patient2.id,
            ci: "70000002",
            name: "Paciente",
            last_name: "Demo 2",
            sex: "MALE" as const,
            birth_date: new Date("1992-06-05"),
            blood_type: "A+",
            nacionality: "Venezolano",
            profession: "Ingeniero",
            main_phone: "0414-0000002",
            allergies: "SEED: asma leve",
        },
        {
            patientId: patient3.id,
            ci: "70000003",
            name: "Paciente",
            last_name: "Demo 3",
            sex: "MALE" as const,
            birth_date: new Date("1988-11-20"),
            blood_type: "B-",
            nacionality: "Venezolano",
            profession: "Comerciante",
            main_phone: "0414-0000003",
            chronic_diseases: "SEED: hipertensión",
        },
        {
            patientId: patient4.id,
            ci: "70000004",
            name: "Paciente",
            last_name: "Demo 4",
            sex: "FEMALE" as const,
            birth_date: new Date("1991-03-15"),
            blood_type: "AB+",
            nacionality: "Venezolana",
            profession: "Diseñadora",
            main_phone: "0414-0000004",
        },
        {
            patientId: patient5.id,
            ci: "70000005",
            name: "Paciente",
            last_name: "Demo 5",
            sex: "MALE" as const,
            birth_date: new Date("1985-09-30"),
            blood_type: "O-",
            nacionality: "Venezolano",
            profession: "Chofer",
            main_phone: "0414-0000005",
        },
        {
            patientId: patient6.id,
            ci: "70000006",
            name: "Paciente",
            last_name: "Demo 6",
            sex: "FEMALE" as const,
            birth_date: new Date("1979-12-11"),
            blood_type: "A-",
            nacionality: "Venezolana",
            profession: "Administrativa",
            main_phone: "0414-0000006",
        },
    ];

    for (const profile of patientProfiles) {
        await ensureInfoPatient(profile);
    }

    const symptomsSeed = ["Fiebre", "Dolor", "Tos", "Cefalea", "Náuseas", "Vómitos", "Mareos", "Fatiga"];
    const symptoms = await Promise.all(symptomsSeed.map((name) => ensureSymptom(name)));

    const diagnosesSeed = [
        { code: "J00", description: "Rinofaringitis aguda (resfriado común)", category: "Respiratorias" },
        { code: "K29", description: "Gastritis", category: "Gastrointestinal" },
        { code: "I10", description: "Hipertensión esencial (primaria)", category: "Cardiovasculares" },
        { code: "R50", description: "Fiebre de origen desconocido", category: "Síntomas" },
        { code: "A09", description: "Gastroenteritis y colitis de origen infeccioso", category: "Infecciosas" },
        { code: "M54", description: "Dorsalgia", category: "Musculoesqueléticas" },
    ] as const;
    const diagnoses = await Promise.all(diagnosesSeed.map((item) => ensureDiagnosis(item)));

    const statusPending = await ensureStatusAppointment("Pendiente", "#facc15");
    const statusConfirmed = await ensureStatusAppointment("Confirmada", "#22c55e");
    const statusCancelled = await ensureStatusAppointment("Cancelada", "#ef4444");
    const statusFinished = await ensureStatusAppointment("Finalizada", "#3b82f6");
    void statusFinished;

    const appointmentConsult = await ensureAppointmentType("Consulta");
    const appointmentControl = await ensureAppointmentType("Control");

    const appointmentBase = new Date("2026-03-22T08:00:00.000Z");
    const appointmentPatients = [patient1, patient2, patient3, patient4, patient5, patient6];

    const appointments = [] as Array<{ id: number }>;
    for (let index = 0; index < appointmentPatients.length; index += 1) {
        const scheduledAt = new Date(appointmentBase.getTime() + index * 60 * 60 * 1000);
        appointments.push(
            await ensureAppointment({
                doctorId: doctor1.id,
                patientId: appointmentPatients[index].id,
                statusId: index % 2 === 0 ? statusPending.id : statusConfirmed.id,
                typeId: appointmentConsult.id,
                price: 20,
                date_time: scheduledAt,
                reson_visit: `SEED: cita general ${index + 1}`,
            })
        );
    }

    for (let index = 0; index < appointmentPatients.length; index += 1) {
        const scheduledAt = new Date(appointmentBase.getTime() + (index + 1) * 60 * 60 * 1000);
        appointments.push(
            await ensureAppointment({
                doctorId: doctor2.id,
                patientId: appointmentPatients[index].id,
                statusId: index % 2 === 0 ? statusConfirmed.id : statusPending.id,
                typeId: appointmentControl.id,
                price: 25,
                date_time: scheduledAt,
                reson_visit: `SEED: control pediátrico ${index + 1}`,
            })
        );
    }

    await ensureAppointment({
        doctorId: doctor3.id,
        patientId: patient1.id,
        statusId: statusCancelled.id,
        typeId: appointmentConsult.id,
        price: 50,
        date_time: new Date("2026-03-24T13:00:00.000Z"),
        reson_visit: "SEED: cita cardiología cancelada",
    });

    const consultation1 = await ensureConsultationBundle({
        doctorId: doctor1.id,
        patientId: patient1.id,
        receptionistId: deps.users.reception,
        statusInvoiceId: deps.finance.invoiceStatuses.paid,
        taxId: deps.finance.taxId,
        exchangeRateId: deps.finance.exchangeRates.active,
        paymentMethodId: deps.finance.paymentMethods.cashUsd,
        invoiceTotalUsd: 20,
        startedAt: new Date("2026-03-22T10:00:00.000Z"),
        finishedAt: new Date("2026-03-22T10:30:00.000Z"),
        symptoms: [
            { symptomId: symptoms[0].id, severity: "Alta", duration: "2 días", notes: "SEED: fiebre inicial" },
            { symptomId: symptoms[2].id, severity: "Media", duration: "3 días", notes: "SEED: tos seca" },
        ],
        diagnoses: [
            { diagnosisId: diagnoses[0].id, isPrimary: true, conditionStatus: "Agudo", onsetDate: new Date("2026-03-20") },
        ],
        supplyConsumptions: [{ supplyId: deps.inventory.products.guantes, quantity: 2 }],
        prescriptions: [
            {
                supplyId: deps.inventory.products.paracetamol,
                medication_name: "Paracetamol 500mg",
                dosage: "1 tableta",
                frequency: "Cada 8 horas",
                duration: "3 días",
                instructions: "SEED: tomar con alimentos",
            },
        ],
        exam: {
            weight: 62.4,
            height: 1.65,
            temperature: 38.2,
            systolic_bp: 118,
            diastolic_bp: 76,
            heart_rate: 88,
            respiratory_rate: 20,
            oxygen_saturation: 97,
        },
    });

    const consultation2 = await ensureConsultationBundle({
        doctorId: doctor2.id,
        patientId: patient2.id,
        receptionistId: deps.users.reception,
        statusInvoiceId: deps.finance.invoiceStatuses.paid,
        taxId: deps.finance.taxId,
        exchangeRateId: deps.finance.exchangeRates.active,
        paymentMethodId: deps.finance.paymentMethods.transferBs,
        invoiceTotalUsd: 25,
        startedAt: new Date("2026-03-23T11:00:00.000Z"),
        finishedAt: new Date("2026-03-23T11:20:00.000Z"),
        symptoms: [
            { symptomId: symptoms[1].id, severity: "Media", duration: "1 día", notes: "SEED: dolor abdominal" },
            { symptomId: symptoms[4].id, severity: "Baja", duration: "1 día" },
        ],
        diagnoses: [
            { diagnosisId: diagnoses[1].id, isPrimary: true, conditionStatus: "Agudo", onsetDate: new Date("2026-03-22") },
        ],
        supplyConsumptions: [{ supplyId: deps.inventory.products.algodon, quantity: 1 }],
        prescriptions: [
            {
                medication_name: "Ibuprofeno 400mg",
                dosage: "1 tableta",
                frequency: "Cada 12 horas",
                duration: "5 días",
                instructions: "SEED: si persiste dolor",
            },
        ],
        exam: {
            weight: 28.5,
            height: 1.15,
            temperature: 37.1,
            systolic_bp: 100,
            diastolic_bp: 66,
            heart_rate: 90,
            respiratory_rate: 22,
            oxygen_saturation: 99,
        },
        igtfAmount: 0.75,
    });

    const consultation3 = await ensureConsultationBundle({
        doctorId: doctor3.id,
        patientId: patient3.id,
        receptionistId: deps.users.reception,
        statusInvoiceId: deps.finance.invoiceStatuses.paid,
        taxId: deps.finance.taxId,
        exchangeRateId: deps.finance.exchangeRates.active,
        paymentMethodId: deps.finance.paymentMethods.zelleUsd,
        invoiceTotalUsd: 50,
        startedAt: new Date("2026-03-24T09:30:00.000Z"),
        finishedAt: new Date("2026-03-24T10:05:00.000Z"),
        symptoms: [
            { symptomId: symptoms[3].id, severity: "Alta", duration: "1 día", notes: "SEED: cefalea pulsátil" },
            { symptomId: symptoms[6].id, severity: "Media", duration: "2 días" },
        ],
        diagnoses: [
            { diagnosisId: diagnoses[2].id, isPrimary: true, conditionStatus: "Controlado", onsetDate: new Date("2026-03-20") },
            { diagnosisId: diagnoses[5].id, isPrimary: false, conditionStatus: "En estudio" },
        ],
        supplyConsumptions: [{ supplyId: deps.inventory.products.jeringa, quantity: 1 }],
        prescriptions: [
            {
                supplyId: deps.inventory.products.amoxicilina,
                medication_name: "Amoxicilina 500mg",
                dosage: "1 cápsula",
                frequency: "Cada 8 horas",
                duration: "7 días",
                instructions: "SEED: completar el tratamiento",
            },
        ],
        exam: {
            weight: 74.1,
            height: 1.73,
            temperature: 36.8,
            systolic_bp: 132,
            diastolic_bp: 84,
            heart_rate: 76,
            respiratory_rate: 18,
            oxygen_saturation: 98,
        },
    });

    return {
        specialties: {
            general: specialtyGeneral.id,
            pediatrics: specialtyPediatrics.id,
            cardiology: specialtyCardiology.id,
            trauma: specialtyTrauma.id,
        },
        doctors: {
            doctor1: doctor1.id,
            doctor2: doctor2.id,
            doctor3: doctor3.id,
        },
        patients: patients.map((patient) => patient.id),
        appointments: appointments.map((appointment) => appointment.id),
        consultations: [
            { id: consultation1.id, invoiceId: consultation1.invoiceId, doctorId: doctor1.id, specialtyCommissionPercentage: 30, invoiceTotalUsd: 20 },
            { id: consultation2.id, invoiceId: consultation2.invoiceId, doctorId: doctor2.id, specialtyCommissionPercentage: 30, invoiceTotalUsd: 25 },
            { id: consultation3.id, invoiceId: consultation3.invoiceId, doctorId: doctor3.id, specialtyCommissionPercentage: 25, invoiceTotalUsd: 50 },
        ],
        symptoms: symptoms.map((symptom) => symptom.id),
        diagnoses: diagnoses.map((diagnosis) => diagnosis.id),
    };
}
