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

const normalize = (value?: string | null) => (value ?? "").toLowerCase();

const isCancelledStatus = (statusName?: string | null): boolean => {
  const status = normalize(statusName);
  return status.includes("cancel") || status.includes("anulad");
};

const isCompletedStatus = (statusName?: string | null): boolean => {
  const status = normalize(statusName);
  return (
    status.includes("complete") ||
    status.includes("finished") ||
    status.includes("final") ||
    status.includes("atend") ||
    status.includes("realiz")
  );
};

const isScheduledStatus = (statusName?: string | null): boolean => {
  const status = normalize(statusName);
  return status.includes("confirm");
};

const getDefaultRange = (): { from: string; to: string } => {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { from: formatDateOnly(from), to: formatDateOnly(now) };
};

export class DoctorAppointmentsService {
  public static async getReport(
    doctorId: number,
    params: DoctorAppointmentsQuery,
  ): Promise<DoctorAppointmentsResponse> {
    const defaults = getDefaultRange();
    const from = params.from ?? defaults.from;
    const to = params.to ?? defaults.to;
    const fromDate = parseDateOnly(from);
    const toDate = parseDateOnly(to, true);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date_time: { gte: fromDate, lte: toDate },
      },
      include: {
        status: true,
        patient: { select: { id: true, name: true } },
      },
      orderBy: { date_time: "asc" },
    });

    const dailyMap = new Map<string, DoctorAppointmentsDailyData>();
    const patientMap = new Map<number, DoctorAppointmentsTopPatient>();
    let completed = 0;
    let cancelled = 0;
    let scheduled = 0;

    for (const appointment of appointments) {
      const dateKey = formatDateOnly(appointment.date_time);
      const daily =
        dailyMap.get(dateKey) ?? {
          date: dateKey,
          total: 0,
          completed: 0,
          cancelled: 0,
        };

      daily.total += 1;

      if (isCompletedStatus(appointment.status?.name)) {
        daily.completed += 1;
        completed += 1;
      } else if (isCancelledStatus(appointment.status?.name)) {
        daily.cancelled += 1;
        cancelled += 1;
      } else if (isScheduledStatus(appointment.status?.name)) {
        scheduled += 1;
      }

      dailyMap.set(dateKey, daily);

      if (appointment.patient) {
        const current = patientMap.get(appointment.patient.id) ?? {
          patientId: appointment.patient.id,
          patientName: appointment.patient.name ?? "Sin nombre",
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          lastAppointmentDate: formatDateOnly(appointment.date_time),
        };

        current.totalAppointments += 1;
        if (isCompletedStatus(appointment.status?.name)) {
          current.completedAppointments += 1;
        } else if (isCancelledStatus(appointment.status?.name)) {
          current.cancelledAppointments += 1;
        }

        if (appointment.date_time) {
          const currentDate = formatDateOnly(appointment.date_time);
          if (currentDate > current.lastAppointmentDate) {
            current.lastAppointmentDate = currentDate;
          }
        }

        patientMap.set(appointment.patient.id, current);
      }
    }

    const total = appointments.length;
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
      message: "Reporte de citas del doctor encontrado exitosamente",
      data: {
        meta: { from, to },
        stats,
        dailyData,
        topPatients,
      },
    };
  }
}
