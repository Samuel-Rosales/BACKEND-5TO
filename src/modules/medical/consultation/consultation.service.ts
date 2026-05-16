import { prisma } from "@/configs";
import { ConsultationStatus } from "@prisma/client";
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
    status: true,
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
    status: true,
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

const patientConsultationSelect = {
    id: true,
    date: true,
    started_at: true,
    finished_at: true,
    status: true,
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
    symptomsConsultations: {
        select: {
            id: true,
            severity: true,
            duration: true,
            notes: true,
            symptom: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    consultationDiagnoses: {
        select: {
            id: true,
            is_primary: true,
            condition_status: true,
            onset_date: true,
            diagnosis: {
                select: {
                    id: true,
                    code: true,
                    description: true,
                },
            },
        },
    },
    clinicalExaminations: {
        select: {
            id: true,
            weight: true,
            height: true,
            temperature: true,
            systolic_bp: true,
            diastolic_bp: true,
            heart_rate: true,
            respiratory_rate: true,
            oxygen_saturation: true,
        },
    },
    prescriptions: {
        select: {
            id: true,
            medication_name: true,
            dosage: true,
            frequency: true,
            duration: true,
            instructions: true,
            active: true,
        },
    },
} as const;

export class ConsultationService {

    private async resolveDoctorId(userIdOrDoctorId: number) {
        const doctorByUser = await prisma.doctor.findUnique({
            where: { userId: userIdOrDoctorId },
            select: { id: true },
        });

        if (doctorByUser) {
            return doctorByUser.id;
        }

        const doctorById = await prisma.doctor.findUnique({
            where: { id: userIdOrDoctorId },
            select: { id: true },
        });

        if (!doctorById) {
            throw new Error("El doctor no existe");
        }

        return doctorById.id;
    }

    private normalizeRange(value?: string) {
        if (!value) return undefined;
        const normalized = value.trim().toLowerCase();

        if (normalized === "today" || normalized === "hoy") return "today" as const;
        if (normalized === "week" || normalized === "semana") return "week" as const;
        if (normalized === "month" || normalized === "mes") return "month" as const;

        return undefined;
    }

    private rangeBoundsUTC(range: "today" | "week" | "month", now: Date) {
        const todayStart = this.dayStartUTC(now);

        if (range === "today") {
            const end = new Date(todayStart);
            end.setDate(end.getDate() + 1);
            return { start: todayStart, end };
        }

        if (range === "week") {
            const dow = todayStart.getDay();
            const daysSinceMonday = (dow + 6) % 7;
            const start = new Date(todayStart);
            start.setDate(start.getDate() - daysSinceMonday);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            return { start, end };
        }

        const start = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 1, 0, 0, 0, 0);
        return { start, end };
    }

    private dayStartUTC(dateTime: Date) {
        return new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate(), 0, 0, 0, 0);
    }

    private formatDateOnlyUTC(dateTime: Date) {
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, "0");
        const day = String(dateTime.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    async create(data: CreateConsultationDto) {
        try {
            const consultation = await prisma.consultation.create({
                data: {
                    ...data,
                    status: ConsultationStatus.PENDING,
                },
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
                    data: {
                        finished_at: finishedAt,
                        status: ConsultationStatus.FINISHED,
                    },
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

    async start(id: number) {
        try {
            const consultation = await prisma.$transaction(async (tx) => {
                const existing = await tx.consultation.findUnique({
                    where: { id },
                    select: { id: true, status: true, started_at: true },
                });

                if (!existing) {
                    throw new Error("La consulta no existe");
                }

                if (existing.status !== ConsultationStatus.PENDING) {
                    throw new Error("La consulta no está pendiente");
                }

                const startedAt = existing.started_at ?? new Date();

                await tx.consultation.update({
                    where: { id },
                    data: {
                        started_at: startedAt,
                        status: ConsultationStatus.IN_PROGRESS,
                    },
                });

                return tx.consultation.findUnique({
                    where: { id },
                    select: consultationSelect,
                });
            });

            if (!consultation) {
                throw new Error("Error iniciando la consulta");
            }

            return {
                status: 200,
                message: "Consulta iniciada éxitosamente",
                data: consultation,
            };
        } catch (error) {
            console.error("Error iniciando la consulta:", error);

            return {
                status: 500,
                message: "Error interno al iniciar la consulta",
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

    async findAllByDoctor(
        doctorId: number,
        filters?: { date?: string; limit?: number; status?: string }
    ) {
        try {
            const resolvedDoctorId = await this.resolveDoctorId(doctorId);
            const parsedRange = filters?.date ? this.parseDateFilter(filters.date) : undefined;
            if (filters?.date && !parsedRange) {
                return {
                    status: 400,
                    message: "Filtro de fecha inválido",
                    error: "date debe tener formato YYYY-MM-DD",
                };
            }
            const filterRange = parsedRange;
            const status = filters?.status;
            if (status && !Object.values(ConsultationStatus).includes(status as ConsultationStatus)) {
                return {
                    status: 400,
                    message: "Filtro de estado inválido",
                    error: "status inválido",
                };
            }
            const consultations = await prisma.consultation.findMany({
                where: {
                    doctorId: resolvedDoctorId,
                    ...(filterRange ? { date: filterRange } : {}),
                    ...(status ? { status: status as ConsultationStatus } : {}),
                },
                orderBy: { date: "desc" },
                ...(filters?.limit ? { take: filters.limit } : {}),
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

    private parseDateFilter(date: string) {
        const parts = date.split("-");
        if (parts.length !== 3) return undefined;
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return undefined;
        const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        if (Number.isNaN(start.getTime())) return undefined;
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        return { gte: start, lt: end } as const;
    }

    async getWeeklyFlowByDoctor(doctorId: number, range?: string) {
        try {
            const resolvedDoctorId = await this.resolveDoctorId(doctorId);
            const normalizedRange = this.normalizeRange(range) ?? "week";
            if (range && !this.normalizeRange(range)) {
                return {
                    status: 400,
                    message: "Filtro inválido",
                    error: "range debe ser: hoy|semana|mes (o today|week|month)",
                };
            }

            const { start, end } = this.rangeBoundsUTC(normalizedRange, new Date());

            const consultations = await prisma.consultation.findMany({
                where: {
                    doctorId: resolvedDoctorId,
                    date: { gte: start, lt: end },
                    status: { not: ConsultationStatus.CANCELLED },
                },
                select: {
                    date: true,
                    status: true,
                },
                orderBy: { date: "asc" },
            });

            const statusColors: Record<ConsultationStatus, string> = {
                [ConsultationStatus.PENDING]: "#f59e0b",
                [ConsultationStatus.IN_PROGRESS]: "#3b82f6",
                [ConsultationStatus.FINISHED]: "#10b981",
                [ConsultationStatus.CANCELLED]: "#94a3b8",
            };

            const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
            const days: {
                day: string;
                date: string;
                count: number;
                statuses: { name: string; color: string; count: number }[];
            }[] = [];
            const indexByDate = new Map<string, number>();

            const cursor = new Date(start);
            while (cursor < end) {
                const dateOnly = this.formatDateOnlyUTC(cursor);
                const label = dayLabels[cursor.getUTCDay()] ?? "";
                indexByDate.set(dateOnly, days.length);
                days.push({ day: label, date: dateOnly, count: 0, statuses: [] });
                cursor.setUTCDate(cursor.getUTCDate() + 1);
            }

            for (const consultation of consultations) {
                const dayStart = this.dayStartUTC(consultation.date);
                const key = this.formatDateOnlyUTC(dayStart);
                const index = indexByDate.get(key);
                if (index !== undefined) {
                    days[index].count += 1;
                    const statusName = consultation.status ?? ConsultationStatus.PENDING;
                    const statusColor = statusColors[statusName] ?? "#94a3b8";
                    const currentStatuses = days[index].statuses;
                    const existing = currentStatuses.find((status) => status.name === statusName);
                    if (existing) {
                        existing.count += 1;
                    } else {
                        currentStatuses.push({ name: statusName, color: statusColor, count: 1 });
                    }
                }
            }

            const total = days.reduce((sum, day) => sum + day.count, 0);

            return {
                status: 200,
                message: "Flujo semanal encontrado éxitosamente",
                data: {
                    range: normalizedRange,
                    start: this.formatDateOnlyUTC(start),
                    end: this.formatDateOnlyUTC(end),
                    total,
                    days,
                },
            };
        } catch (error) {
            console.error("Error buscando flujo semanal:", error);

            return {
                status: 500,
                message: "Error interno al buscar el flujo semanal",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAllByPatient(patientId: number) {
        try {
            const consultations = await prisma.consultation.findMany({
                where: {
                    invoice: {
                        patientId: patientId,
                    },
                },
                orderBy: { date: "desc" },
                select: patientConsultationSelect,
            });

            if (!consultations) {
                throw new Error("Error buscando consultas del paciente");
            }

            if (consultations.length === 0) {
                return {
                    status: 200,
                    message: "Paciente no tiene consultas registradas",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Consultas encontradas éxitosamente",
                data: consultations,
            };
        } catch (error) {
            console.error("Error buscando consultas del paciente:", error);

            return {
                status: 500,
                message: "Error interno al buscar las consultas del paciente",
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
