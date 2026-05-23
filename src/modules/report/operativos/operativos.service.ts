import fs from 'fs';
import path from 'path';
import { prisma } from '@/configs';
import React from 'react';
import { ReportPeriod, ReportQueryRange, OperativosCitasDay, OperativosCitasResponse, OperativosOverviewResponse, OperativosProductividadResponse, OperativosTiemposResponse, OperativosTiemposSpecialty } from './operativos.interface';

type PdfRenderer = any;

const DAY_MS = 24 * 60 * 60 * 1000;
const SLOT_LABELS = ['07:00 - 09:00', '09:00 - 11:00', '11:00 - 13:00', '14:00 - 16:00'] as const;
const SLOT_RANGES = [
    { label: SLOT_LABELS[0], startHour: 7, endHour: 9 },
    { label: SLOT_LABELS[1], startHour: 9, endHour: 11 },
    { label: SLOT_LABELS[2], startHour: 11, endHour: 13 },
    { label: SLOT_LABELS[3], startHour: 14, endHour: 16 },
] as const;

const resolveLogoBase64 = () => {
    const candidates = [
        path.resolve(process.cwd(), '..', 'FRONTEND-5TO', 'src', 'assets', 'clinicasintext.png'),
        path.resolve(process.cwd(), '..', '..', 'FRONTEND-5TO', 'src', 'assets', 'clinicasintext.png'),
    ];
    const foundPath = candidates.find((candidate) => fs.existsSync(candidate));
    if (foundPath) {
        const bitmap = fs.readFileSync(foundPath);
        return `data:image/png;base64,${bitmap.toString('base64')}`;
    }
    return null;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const roundMinutes = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;

const toNumber = (value: unknown): number => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const parseDateOnly = (value: string, isEnd = false): Date => {
    const suffix = isEnd ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
    return new Date(`${value}${suffix}`);
};

const normalize = (value?: string | null) => (value ?? '').toLowerCase();

const isCancelledStatus = (statusName?: string | null): boolean => {
    const status = normalize(statusName);
    return status.includes('cancel') || status.includes('anulad');
};

const isCompletedStatus = (statusName?: string | null): boolean => {
    const status = normalize(statusName);
    return status.includes('complete') || status.includes('finished') || status.includes('final') || status.includes('atend') || status.includes('realiz');
};

const isScheduledStatus = (statusName?: string | null): boolean => {
    const status = normalize(statusName);
    return status.includes('sched') || status.includes('program') || status.includes('pend') || status.includes('agend');
};

const getDefaultRange = (_period: ReportPeriod): { from: string; to: string } => {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
    return { from: formatDateOnly(from), to: formatDateOnly(now) };
};

const getResolvedRange = (params: { from?: string; to?: string; period?: ReportPeriod }): { period: ReportPeriod; from: string; to: string } => {
    const period = params.period ?? 'month';
    const defaults = getDefaultRange(period);
    return {
        period,
        from: params.from ?? defaults.from,
        to: params.to ?? defaults.to,
    };
};

const getMinutesDiff = (start?: Date | null, end?: Date | null) => {
    if (!start || !end) return 0;
    return Math.max(0, (end.getTime() - start.getTime()) / 60000);
};

const getHourLabel = (date: Date) => `${String(date.getUTCHours()).padStart(2, '0')}:00`;

const moneyText = (value: number) => `$${roundMoney(value).toFixed(2)}`;

const createStyles = (StyleSheet: PdfRenderer['StyleSheet']) => StyleSheet.create({
    page: { padding: 36, fontFamily: 'Helvetica', fontSize: 10 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottom: '1 solid #cbd5e1', paddingBottom: 10 },
    headerTextContainer: { flex: 1, marginLeft: 15 },
    title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 4 },
    subtitle: { fontSize: 12, color: '#475569' },
    meta: { fontSize: 9, color: '#64748b', marginTop: 4 },
    section: { marginTop: 14 },
    sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0f172a', backgroundColor: '#f1f5f9', padding: 6, marginBottom: 8 },
    table: { borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', paddingVertical: 5, paddingHorizontal: 6 },
    tableRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 6, borderTop: '0.5 solid #e2e8f0' },
    tableCell: { flex: 1, color: '#334155' },
    tableCellRight: { width: 90, textAlign: 'right', color: '#334155' },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 6, borderBottom: '0.5 solid #e2e8f0' },
    rowLabel: { color: '#334155', flex: 1 },
    rowValue: { color: '#334155', textAlign: 'right', width: 120 },
    footer: { position: 'absolute', bottom: 28, left: 36, right: 36, textAlign: 'center', color: '#64748b', fontSize: 8 },
});

const t = (Text: any, content: React.ReactNode, style?: unknown) => React.createElement(Text, { style }, content);
const v = (View: any, children: React.ReactNode[], style?: unknown) => React.createElement(View, { style }, ...children);

const createOperativosDocument = (pdf: PdfRenderer, styles: ReturnType<typeof createStyles>) => ({ overview, citas, tiempos, productividad, logoDataUri }: { overview: OperativosOverviewResponse['data']; citas: OperativosCitasResponse['data']; tiempos: OperativosTiemposResponse['data']; productividad: OperativosProductividadResponse['data']; logoDataUri: string | null; }) => React.createElement(
    pdf.Document as any,
    null,
    React.createElement(
        pdf.Page as any,
        { size: 'A4', style: styles.page },
        v([
            logoDataUri ? React.createElement(pdf.Image as any, { src: logoDataUri, style: { width: 56, height: 56 } }) : null,
            v([
                t(pdf.Text, 'Reporte Operativo', styles.title),
                t(pdf.Text, 'Resumen consolidado de actividad asistencial', styles.subtitle),
                t(pdf.Text, `Periodo: ${overview.meta.from} - ${overview.meta.to} | Generado: ${new Date().toLocaleString('es-VE')}`, styles.meta),
            ], styles.headerTextContainer)
        ], styles.header),
            v([
                t(pdf.Text, 'RESUMEN', styles.sectionTitle),
                v(pdf.View, [t(pdf.Text, 'Citas programadas', styles.rowLabel), t(pdf.Text, String(overview.stats.scheduledAppointments), styles.rowValue)], styles.row),
            v(pdf.View, [t(pdf.Text, 'Pacientes atendidos', styles.rowLabel), t(pdf.Text, String(overview.stats.patientsAttended), styles.rowValue)], styles.row),
            v(pdf.View, [t(pdf.Text, 'Tiempo promedio', styles.rowLabel), t(pdf.Text, `${overview.stats.avgAttentionTime} min`, styles.rowValue)], styles.row),
            v(pdf.View, [t(pdf.Text, 'Médicos activos', styles.rowLabel), t(pdf.Text, String(overview.stats.activeDoctors), styles.rowValue)], styles.row),
            ], styles.section),
            v([
                t(pdf.Text, 'CITAS', styles.sectionTitle),
                v(pdf.View, [
                    t(pdf.Text, 'Día', styles.tableCell),
                    t(pdf.Text, 'Atendidas', styles.tableCellRight),
                    t(pdf.Text, 'Canceladas', styles.tableCellRight),
                ], styles.tableHeader),
                ...citas.dailyData.slice(0, 10).map((item) => v(pdf.View, [
                    t(pdf.Text, item.date, styles.tableCell),
                    t(pdf.Text, String(item.attended), styles.tableCellRight),
                    t(pdf.Text, String(item.cancelled), styles.tableCellRight),
                ], styles.tableRow)),
                v(pdf.View, [t(pdf.Text, 'Total citas', styles.rowLabel), t(pdf.Text, String(citas.stats.totalAppointments), styles.rowValue)], styles.row),
                v(pdf.View, [t(pdf.Text, 'Completadas', styles.rowLabel), t(pdf.Text, String(citas.stats.completedAppointments), styles.rowValue)], styles.row),
                v(pdf.View, [t(pdf.Text, 'Canceladas', styles.rowLabel), t(pdf.Text, String(citas.stats.cancelledAppointments), styles.rowValue)], styles.row),
            ], styles.section),
            v([
                t(pdf.Text, 'TIEMPOS', styles.sectionTitle),
                v(pdf.View, [
                    t(pdf.Text, 'Especialidad', styles.tableCell),
                    t(pdf.Text, 'Promedio', styles.tableCellRight),
                    t(pdf.Text, 'Consultas', styles.tableCellRight),
                ], styles.tableHeader),
                ...tiempos.bySpecialty.slice(0, 8).map((item) => v(pdf.View, [
                    t(pdf.Text, item.area, styles.tableCell),
                    t(pdf.Text, `${item.consult.toFixed(1)} min`, styles.tableCellRight),
                    t(pdf.Text, String(item.consultations), styles.tableCellRight),
                ], styles.tableRow)),
                v(pdf.View, [t(pdf.Text, 'Tiempo promedio consulta', styles.rowLabel), t(pdf.Text, `${tiempos.stats.avgConsultTime.toFixed(1)} min`, styles.rowValue)], styles.row),
                v(pdf.View, [t(pdf.Text, 'Hora pico', styles.rowLabel), t(pdf.Text, tiempos.stats.peakHour, styles.rowValue)], styles.row),
                v(pdf.View, [t(pdf.Text, 'Consultas totales', styles.rowLabel), t(pdf.Text, String(tiempos.stats.totalConsultations), styles.rowValue)], styles.row),
            ], styles.section),
            v([
                t(pdf.Text, 'PRODUCTIVIDAD', styles.sectionTitle),
                v(pdf.View, [
                    t(pdf.Text, 'Médico', styles.tableCell),
                    t(pdf.Text, 'Atenciones', styles.tableCellRight),
                    t(pdf.Text, 'Tiempo', styles.tableCellRight),
                    t(pdf.Text, 'Ingresos', styles.tableCellRight),
                ], styles.tableHeader),
                ...productividad.byDoctor.slice(0, 8).map((item) => v(pdf.View, [
                    t(pdf.Text, item.name, styles.tableCell),
                    t(pdf.Text, String(item.attended), styles.tableCellRight),
                    t(pdf.Text, `${item.avgTime.toFixed(1)} min`, styles.tableCellRight),
                    t(pdf.Text, moneyText(item.revenue), styles.tableCellRight),
                ], styles.tableRow)),
                v(pdf.View, [t(pdf.Text, 'Médicos en turno', styles.rowLabel), t(pdf.Text, String(productividad.stats.doctorsInShift), styles.rowValue)], styles.row),
                v(pdf.View, [t(pdf.Text, 'Atenciones promedio', styles.rowLabel), t(pdf.Text, productividad.stats.avgAttentions.toFixed(1), styles.rowValue)], styles.row),
                v(pdf.View, [t(pdf.Text, 'Ingreso promedio', styles.rowLabel), t(pdf.Text, moneyText(productividad.stats.avgRevenue), styles.rowValue)], styles.row),
            ], styles.section),
            t(pdf.Text, 'VitalFe & Alegria', styles.footer),
        )
);

export class OperativosService {
    public static async getOverview(params: Partial<ReportQueryRange>): Promise<OperativosOverviewResponse> {
        const resolvedRange = getResolvedRange(params);
        const fromDate = parseDateOnly(resolvedRange.from);
        const toDate = parseDateOnly(resolvedRange.to, true);

        const [appointments, consultations, doctors, invoices, schedules] = await Promise.all([
            prisma.appointment.findMany({ where: { date_time: { gte: fromDate, lte: toDate } }, include: { status: true } }),
            prisma.consultation.findMany({ where: { date: { gte: fromDate, lte: toDate } }, include: { doctor: { include: { specialty: true } } } }),
            prisma.doctor.findMany({ where: { active: true }, include: { schedules: { include: { availabilities: true } } } }),
            prisma.invoice.findMany({ where: { date_at: { gte: fromDate, lte: toDate } }, include: { status: true } }),
            prisma.doctorAvailability.findMany({ include: { doctorSchedule: { include: { doctor: true } } } }),
        ]);

        const completedConsultations = consultations.filter((consultation) => consultation.status === 'FINISHED');
        const avgAttentionTime = roundMinutes(
            completedConsultations.reduce((sum, consultation) => sum + getMinutesDiff(consultation.started_at, consultation.finished_at), 0) /
            Math.max(completedConsultations.length, 1)
        );

        const activeDoctorsToday = new Set(
            schedules
                .filter((availability) => availability.doctorSchedule?.doctor?.active)
                .map((availability) => availability.doctorSchedule.doctorId)
        ).size;

        const todayRevenueUsd = roundMoney(
            invoices.reduce((sum, invoice) => {
                if (isCancelledStatus(invoice.status?.name)) return sum;
                return sum + toNumber(invoice.total_usd);
            }, 0)
        );

        const todayAppointments = appointments.length;

        const occupancyBySlot = SLOT_RANGES.map((slot) => {
            const slotAppointments = appointments.filter((appointment) => {
                const hour = appointment.date_time.getUTCHours();
                return hour >= slot.startHour && hour < slot.endHour;
            });

            const count = slotAppointments.length;
            return {
                slot: slot.label,
                count,
                status: count === 0 ? 'Normal' : count <= 3 ? 'Normal' : count <= 6 ? 'Alto' : 'Critico',
            } as const;
        });

        return {
            message: 'Resumen operativo encontrado exitosamente',
            data: {
                meta: {
                    from: resolvedRange.from,
                    to: resolvedRange.to,
                    period: resolvedRange.period,
                },
                stats: {
                    scheduledAppointments: appointments.length,
                    avgAttentionTime,
                    patientsAttended: consultations.filter((consultation) => consultation.status === 'FINISHED').length,
                    activeDoctors: doctors.length,
                },
                periodSummary: {
                    activeDoctors: activeDoctorsToday,
                    revenueUsd: todayRevenueUsd,
                    appointments: todayAppointments,
                },
                occupancyBySlot,
            },
        };
    }

    public static async getCitas(params: Partial<ReportQueryRange>): Promise<OperativosCitasResponse> {
        const resolvedRange = getResolvedRange(params);
        const fromDate = parseDateOnly(resolvedRange.from);
        const toDate = parseDateOnly(resolvedRange.to, true);

        const appointments = await prisma.appointment.findMany({
            where: { date_time: { gte: fromDate, lte: toDate } },
            include: { status: true },
            orderBy: { date_time: 'asc' },
        });

        const dailyMap = new Map<string, OperativosCitasDay>();
        let completedAppointments = 0;
        let cancelledAppointments = 0;

        for (const appointment of appointments) {
            const dateKey = formatDateOnly(appointment.date_time);
            const current = dailyMap.get(dateKey) ?? { date: dateKey, attended: 0, cancelled: 0 };

            if (isCompletedStatus(appointment.status?.name)) {
                current.attended += 1;
                completedAppointments += 1;
            } else if (isCancelledStatus(appointment.status?.name)) {
                current.cancelled += 1;
                cancelledAppointments += 1;
            }

            dailyMap.set(dateKey, current);
        }

        const totalAppointments = appointments.length;

        return {
            message: 'Reporte de citas encontrado exitosamente',
            data: {
                meta: {
                    from: resolvedRange.from,
                    to: resolvedRange.to,
                    period: resolvedRange.period,
                },
                stats: {
                    totalAppointments,
                    completedAppointments,
                    cancelledAppointments,
                    completionRate: totalAppointments > 0 ? roundMoney((completedAppointments / totalAppointments) * 100) : 0,
                    cancellationRate: totalAppointments > 0 ? roundMoney((cancelledAppointments / totalAppointments) * 100) : 0,
                },
                dailyData: [...dailyMap.values()],
            },
        };
    }

    public static async getTiempos(params: Partial<ReportQueryRange>): Promise<OperativosTiemposResponse> {
        const resolvedRange = getResolvedRange(params);
        const fromDate = parseDateOnly(resolvedRange.from);
        const toDate = parseDateOnly(resolvedRange.to, true);

        const consultations = await prisma.consultation.findMany({
            where: { date: { gte: fromDate, lte: toDate } },
            include: { doctor: { include: { specialty: true } } },
            orderBy: { date: 'asc' },
        });

        const specialtyMap = new Map<string, OperativosTiemposSpecialty>();
        const hourMap = new Map<string, number>();
        let totalConsultTime = 0;
        let totalCompleted = 0;

        for (const consultation of consultations) {
            if (!consultation.started_at || !consultation.finished_at) continue;

            const consultMinutes = getMinutesDiff(consultation.started_at, consultation.finished_at);
            totalConsultTime += consultMinutes;
            totalCompleted += 1;

            const specialtyName = consultation.doctor?.specialty?.name ?? 'Sin especialidad';
            const current = specialtyMap.get(specialtyName) ?? { area: specialtyName, consult: 0, consultations: 0 };
            current.consult += consultMinutes;
            current.consultations += 1;
            specialtyMap.set(specialtyName, current);

            const hourLabel = getHourLabel(consultation.date);
            hourMap.set(hourLabel, (hourMap.get(hourLabel) ?? 0) + 1);
        }

        const peakEntry = [...hourMap.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['00:00', 0];

        return {
            message: 'Reporte de tiempos encontrado exitosamente',
            data: {
                meta: {
                    from: resolvedRange.from,
                    to: resolvedRange.to,
                    period: resolvedRange.period,
                },
                stats: {
                    avgConsultTime: totalCompleted > 0 ? roundMinutes(totalConsultTime / totalCompleted) : 0,
                    totalConsultations: totalCompleted,
                    peakHour: peakEntry[0],
                    peakHourCount: peakEntry[1],
                },
                bySpecialty: [...specialtyMap.values()]
                    .map((item) => ({
                        area: item.area,
                        consult: item.consultations > 0 ? roundMinutes(item.consult / item.consultations) : 0,
                        consultations: item.consultations,
                    }))
                    .sort((a, b) => b.consultations - a.consultations),
            },
        };
    }

  public static async getProductividad(params: Partial<ReportQueryRange>): Promise<OperativosProductividadResponse> {
        const resolvedRange = getResolvedRange(params);
        const fromDate = parseDateOnly(resolvedRange.from);
        const toDate = parseDateOnly(resolvedRange.to, true);

        const doctors = await prisma.doctor.findMany({
            where: { active: true },
            include: {
                user: true,
                consultations: {
                    where: { date: { gte: fromDate, lte: toDate } },
                    include: { invoice: true },
                },
                schedules: { include: { availabilities: true } },
            },
            orderBy: { id: 'asc' },
        });

        const isCompletedConsultation = (consultation: { status: string; started_at: Date | null; finished_at: Date | null }) => {
            return consultation.status === 'FINISHED' || Boolean(consultation.started_at && consultation.finished_at);
        };

        const byDoctor = doctors.map((doctor) => {
            const attendedConsultations = doctor.consultations.filter(isCompletedConsultation);
            const attended = attendedConsultations.length;
            const avgTime = attendedConsultations.length > 0
                ? roundMinutes(attendedConsultations.reduce((sum, consultation) => sum + getMinutesDiff(consultation.started_at, consultation.finished_at), 0) / attendedConsultations.length)
                : 0;
            const revenue = roundMoney(attendedConsultations.reduce((sum, consultation) => sum + toNumber(consultation.invoice?.total_usd), 0));

            return {
                name: doctor.user.name,
                attended,
                avgTime,
                revenue,
            };
        });

        const doctorsInShift = doctors.filter((doctor) => doctor.schedules.some((schedule) => schedule.availabilities.length > 0)).length;
        const avgAttentions = byDoctor.length > 0 ? roundMinutes(byDoctor.reduce((sum, item) => sum + item.attended, 0) / byDoctor.length) : 0;
        const avgRevenue = byDoctor.length > 0 ? roundMoney(byDoctor.reduce((sum, item) => sum + item.revenue, 0) / byDoctor.length) : 0;

        return {
            message: 'Reporte de productividad encontrado exitosamente',
            data: {
                meta: {
                    from: resolvedRange.from,
                    to: resolvedRange.to,
                    period: resolvedRange.period,
                },
                stats: {
                    doctorsInShift,
                    avgAttentions,
                    avgRevenue,
                },
                byDoctor,
            },
        };
  }

    public static async generatePdf(params: Partial<ReportQueryRange>): Promise<Buffer> {
        const logoDataUri = resolveLogoBase64();
        const [overview, citas, tiempos, productividad] = await Promise.all([
            this.getOverview(params),
            this.getCitas(params),
            this.getTiempos(params),
            this.getProductividad(params),
        ]);

        const pdf = await import('@react-pdf/renderer');
        const styles = createStyles(pdf.StyleSheet);
        const doc = React.createElement(createOperativosDocument(pdf, styles), {
            overview: overview.data,
            citas: citas.data,
            tiempos: tiempos.data,
            productividad: productividad.data,
            logoDataUri
        });
        return await pdf.renderToBuffer(doc as React.ReactElement<any>);
    }
}