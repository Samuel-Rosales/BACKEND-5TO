import { prisma } from "@/configs";
import { ensureMonthlyPayrollLine } from "@/modules/finance/payroll/payroll.service";
import {
    CreateConsultationDto,
    FinishConsultationDto,
    UpdateConsultationDto,
} from "./consultation.interface";

const consultationStockReason = (consultationId: number) => `CONSULTATION:${consultationId}`;

const consultationSelect = {
    id: true,
    invoiceId: true,
    doctorId: true,
    date: true,
    started_at: true,
    finished_at: true,
    invoice: {
        select: {
            id: true,
            patientId: true,
            total_usd: true,
            patient: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                    user: {
                        select: {
                            ci: true,
                            name: true,
                        },
                    },
                }
            }
        }
    },
    doctor: {
        select: {
            id: true,
            userId: true,
            specialtyId: true,
            user: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                },
            },
            specialty: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
} as const;

const oneConsultationSelect = {
    id: true,
    date: true,
    started_at: true,
    finished_at: true,
    invoice: {
        select: {
            id: true,
            total_usd: true,
            patient: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                    user: {
                        select: {
                            ci: true,
                            name: true,
                        },
                    },
                }
            }
        }
    },
    doctor: {
        select: {
            id: true,
            specialtyId: true,
            user: {
                select: {
                    id: true,
                    ci: true,
                    name: true,
                },
            },
            specialty: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    symptomsConsultations: true,
    consultationDiagnoses: true,
    clinicalExaminations: true,
    prescriptions: true,
    supplies: true,
} as const;

export class ConsultationService {

    async create(data: CreateConsultationDto) {
        try {
            const consultation = await prisma.consultation.create({
                data,
                select: consultationSelect,
            });

            if (!consultation) {
                throw new Error("Error creando la consulta");
            }

            return {
                status: 201,
                message: "Consulta creada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error creando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al crear la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async finish(id: number, data: FinishConsultationDto) {
        try {
            const consultation = await prisma.$transaction(async (tx) => {
                const finishedAt = data.finished_at ? new Date(data.finished_at) : new Date();

                const existing = await tx.consultation.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        doctor: { select: { userId: true } },
                    },
                });

                if (!existing) {
                    throw new Error("La consulta no existe");
                }

                const reason = consultationStockReason(id);

                // If the consultation is re-finished, rollback previous stock consumption first.
                const previousMovements = await tx.stockMovement.findMany({
                    where: { reason, type: "OUT" },
                    select: { id: true, stockLotId: true, quantity: true },
                    orderBy: { id: "asc" },
                });

                if (previousMovements.length > 0) {
                    for (const m of previousMovements) {
                        await tx.stockLot.update({
                            where: { id: m.stockLotId },
                            data: { quantity: { increment: m.quantity } },
                        });
                    }

                    await tx.stockMovement.deleteMany({ where: { reason } });
                }

                await tx.consultation.update({
                    where: { id },
                    data: { finished_at: finishedAt },
                });

                await tx.supplyConsultation.deleteMany({ where: { consultationId: id } });
                await tx.prescription.deleteMany({ where: { consultationId: id } });
                await tx.symptomsConsultation.deleteMany({ where: { consultation_id: id } });
                await tx.clinicalExamination.deleteMany({ where: { consultation_id: id } });
                await tx.consultationDiagnosis.deleteMany({ where: { consultation_id: id } });

                if (data.supplies.length > 0) {
                    await tx.supplyConsultation.createMany({
                        data: data.supplies.map((s) => ({
                            consultationId: id,
                            supplyId: s.supplyId,
                            quantity: s.quantity,
                        })),
                    });
                }

                // Consume stock (FIFO by expiration_date, then createdAt) and register OUT movements.
                for (const s of data.supplies) {
                    const requested = Number(s.quantity);
                    if (!Number.isFinite(requested) || requested <= 0) {
                        throw new Error("Cantidad de insumo inválida");
                    }

                    // StockLot quantity is Int, so we only support integer consumption.
                    const requestedInt = Math.trunc(requested);
                    if (requestedInt !== requested) {
                        throw new Error("La cantidad de insumo debe ser un entero (sin decimales)");
                    }

                    let remaining = requestedInt;

                    const lots = await tx.stockLot.findMany({
                        where: { supplyId: s.supplyId, quantity: { gt: 0 } },
                        orderBy: [{ expiration_date: "asc" }, { createdAt: "asc" }, { id: "asc" }],
                        select: { id: true, quantity: true },
                    });

                    const available = lots.reduce((acc, lot) => acc + lot.quantity, 0);
                    if (available < remaining) {
                        throw new Error(`Stock insuficiente para el insumo ${s.supplyId}. Disponible: ${available}, Requerido: ${remaining}`);
                    }

                    for (const lot of lots) {
                        if (remaining <= 0) break;
                        const take = Math.min(remaining, lot.quantity);
                        if (take <= 0) continue;

                        await tx.stockLot.update({
                            where: { id: lot.id },
                            data: { quantity: { decrement: take } },
                        });

                        await tx.stockMovement.create({
                            data: {
                                supplyId: s.supplyId,
                                stockLotId: lot.id,
                                userId: existing.doctor.userId,
                                type: "OUT",
                                quantity: take,
                                reason,
                                date: finishedAt,
                            },
                        });

                        remaining -= take;
                    }
                }

                if (data.prescriptions.length > 0) {
                    await tx.prescription.createMany({
                        data: data.prescriptions.map((p) => ({
                            consultationId: id,
                            supplyId: p.supplyId ?? null,
                            medication_name: p.medication_name ?? null,
                            dosage: p.dosage ?? null,
                            frequency: p.frequency ?? null,
                            duration: p.duration ?? null,
                            instructions: p.instructions ?? null,
                            active: p.active ?? true,
                        })),
                    });
                }

                if (data.symptomsConsultas.length > 0) {
                    await tx.symptomsConsultation.createMany({
                        data: data.symptomsConsultas.map((s) => ({
                            consultation_id: id,
                            symptoms_id: s.symptomId,
                            severity: s.severity,
                            duration: s.duration,
                            notes: s.notes ?? null,
                        })),
                    });
                }

                if (data.clinicalExaminations.length > 0) {
                    await tx.clinicalExamination.createMany({
                        data: data.clinicalExaminations.map((e) => ({
                            consultation_id: id,
                            weight: e.weight ?? null,
                            height: e.height ?? null,
                            temperature: e.temperature ?? null,
                            systolic_bp: e.systolic_bp ?? null,
                            diastolic_bp: e.diastolic_bp ?? null,
                            heart_rate: e.heart_rate ?? null,
                            respiratory_rate: e.respiratory_rate ?? null,
                            oxygen_saturation: e.oxygen_saturation ?? null,
                        })),
                    });
                }

                if (data.consultationDiagnoses.length > 0) {
                    await tx.consultationDiagnosis.createMany({
                        data: data.consultationDiagnoses.map((d) => ({
                            consultation_id: id,
                            diagnosisId: d.diagnosisId,
                            is_primary: d.is_primary,
                            condition_status: d.condition_status ?? null,
                            onset_date: d.onset_date ? new Date(d.onset_date) : null,
                        })),
                    });
                }

                await ensureMonthlyPayrollLine(tx, id, finishedAt);

                return tx.consultation.findUnique({
                    where: { id },
                    select: consultationSelect,
                });
            });

            if (!consultation) {
                throw new Error("Error finalizando la consulta");
            }

            return {
                status: 200,
                message: "Consulta finalizada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error finalizando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al finalizar la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const consultations = await prisma.consultation.findMany({
                orderBy: { date: "desc" },
                select: consultationSelect,
            });

            if (!consultations) {
                throw new Error("Error buscando consultas");
            }

            if (consultations.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron consultas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Consultas encontradas éxitosamente",
                data: consultations,
            };
        } catch (error) {
            console.error("Error buscando consultas:", error);

            return {
                status: 500,
                message: "Error interno al buscar las consultas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAllByDoctor(doctorId: number) {
        try {
            const consultations = await prisma.consultation.findMany({
                where: { doctorId: doctorId },
                orderBy: { date: "desc" },
                select: consultationSelect,
            });

            if (!consultations) {
                throw new Error("Error buscando consultas");
            }

            if (consultations.length === 0) {
                return {
                    status: 200,
                    message: "Doctor no tiene consultas registradas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Consultas encontradas éxitosamente",
                data: consultations,
            };
        } catch (error) {
            console.error("Error buscando consultas:", error);

            return {
                status: 500,
                message: "Error interno al buscar las consultas",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }

    }

    async findOne(id: number) {
        try {
            const consultation = await prisma.consultation.findUnique({
                where: { id },
                select: oneConsultationSelect,
            });

            if (!consultation) {
                throw new Error("Error buscando la consulta");
            }

            return {
                status: 200,
                message: "Consulta encontrada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error buscando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al buscar la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdateConsultationDto) {
        try {
            const consultation = await prisma.$transaction(async (tx) => {
                const before = await tx.consultation.findUnique({
                    where: { id },
                    select: { finished_at: true },
                });

                const updated = await tx.consultation.update({
                    where: { id },
                    data,
                    select: consultationSelect,
                });

                return updated;
            });

            if (!consultation) {
                throw new Error("Error actualizando la consulta");
            }

            return {
                status: 200,
                message: "Consulta actualizada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error actualizando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const consultation = await prisma.consultation.delete({
                where: { id },
                select: consultationSelect,
            });

            if (!consultation) {
                throw new Error("Error eliminando la consulta");
            }

            return {
                status: 200,
                message: "Consulta eliminada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error eliminando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la consulta",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
