import { prisma } from "@/configs";
import {
  DoctorAppointmentsQuery,
  DoctorAppointmentsResponse,
  DoctorAppointmentsDailyData,
  DoctorAppointmentsTopPatient,
} from "./doctorAppointments.interface";

const formatDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const parseDateOnly = (value: string, isEnd = false): Date => {
  const suffix = isEnd ? "T23:59:59.999Z" : "T00:00:00.000Z";
  return new Date(`${value}${suffix}`);
};

const getDefaultRange = (): { from: string; to: string } => {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { from: formatDateOnly(from), to: formatDateOnly(now) };
};

export class DoctorAppointmentsService {
  public static async getReport(
    userId: number,
    params: DoctorAppointmentsQuery,
  ): Promise<DoctorAppointmentsResponse> {
    const defaults = getDefaultRange();
    const from = params.from ?? defaults.from;
    const to = params.to ?? defaults.to;
    const fromDate = parseDateOnly(from);
    const toDate = parseDateOnly(to, true);

    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      return {
        message: "Doctor no encontrado",
        data: {
          meta: { from, to },
          stats: { total: 0, completed: 0, cancelled: 0, scheduled: 0 },
          dailyData: [],
          topPatients: [],
        },
      };
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: fromDate, lte: toDate },
      },
      include: {
        invoice: {
          select: {
            id: true,
            date_at: true,
            patient: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const cancelledAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date_time: { gte: fromDate, lte: toDate },
        status: { name: { contains: "cancel", mode: "insensitive" } },
      },
      include: {
        patient: { select: { id: true, name: true } },
        status: { select: { name: true } },
      },
      orderBy: { date_time: "asc" },
    });

    const consultationKeys = new Set<string>();
    for (const c of consultations) {
      const patientId = c.invoice?.patient?.id;
      if (patientId) {
        consultationKeys.add(`${c.doctorId}-${patientId}-${formatDateOnly(c.date)}`);
      }
    }

    const dailyMap = new Map<string, DoctorAppointmentsDailyData>();
    const patientMap = new Map<number, DoctorAppointmentsTopPatient>();
    let completed = 0;
    let cancelled = 0;
    let scheduled = 0;

    for (const consultation of consultations) {
      const dateKey = formatDateOnly(consultation.date);
      const daily =
        dailyMap.get(dateKey) ??
        ({
          date: dateKey,
          total: 0,
          completed: 0,
          cancelled: 0,
        } satisfies DoctorAppointmentsDailyData);

      daily.total += 1;

      if (consultation.status === "FINISHED") {
        daily.completed += 1;
        completed += 1;
      } else if (consultation.status === "CANCELLED") {
        daily.cancelled += 1;
        cancelled += 1;
      } else {
        scheduled += 1;
      }

      dailyMap.set(dateKey, daily);

      const patient = consultation.invoice?.patient;
      if (patient) {
        const current = patientMap.get(patient.id) ?? {
          patientId: patient.id,
          patientName: patient.name ?? "Sin nombre",
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          lastAppointmentDate: dateKey,
        };

        current.totalAppointments += 1;
        if (consultation.status === "FINISHED") {
          current.completedAppointments += 1;
        } else if (consultation.status === "CANCELLED") {
          current.cancelledAppointments += 1;
        }

        if (dateKey > current.lastAppointmentDate) {
          current.lastAppointmentDate = dateKey;
        }

        patientMap.set(patient.id, current);
      }
    }

    for (const appointment of cancelledAppointments) {
      const dateKey = formatDateOnly(appointment.date_time);
      const dedupKey = `${appointment.doctorId}-${appointment.patientId}-${dateKey}`;
      if (consultationKeys.has(dedupKey)) continue;

      const daily =
        dailyMap.get(dateKey) ??
        ({
          date: dateKey,
          total: 0,
          completed: 0,
          cancelled: 0,
        } satisfies DoctorAppointmentsDailyData);

      daily.total += 1;
      daily.cancelled += 1;
      cancelled += 1;
      dailyMap.set(dateKey, daily);

      const current = patientMap.get(appointment.patient.id) ?? {
        patientId: appointment.patient.id,
        patientName: appointment.patient.name ?? "Sin nombre",
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        lastAppointmentDate: dateKey,
      };

      current.totalAppointments += 1;
      current.cancelledAppointments += 1;
      if (dateKey > current.lastAppointmentDate) {
        current.lastAppointmentDate = dateKey;
      }
      patientMap.set(appointment.patient.id, current);
    }

    const total = consultations.length + cancelledAppointments.filter((a) => {
      const dateKey = formatDateOnly(a.date_time);
      return !consultationKeys.has(`${a.doctorId}-${a.patientId}-${dateKey}`);
    }).length;
    const stats = {
      total,
      completed,
      cancelled,
      scheduled,
    };

    const dailyData = [...dailyMap.values()];
    const topPatients = [...patientMap.values()]
      .sort((a, b) => b.totalAppointments - a.totalAppointments)
      .slice(0, 5);

    return {
      message: "Reporte de consultas del doctor encontrado exitosamente",
      data: {
        meta: { from, to },
        stats,
        dailyData,
        topPatients,
      },
    };
  }
}
