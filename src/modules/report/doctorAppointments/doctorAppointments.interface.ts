export interface DoctorAppointmentsQuery {
  from?: string;
  to?: string;
  userId?: string;
}

export interface DoctorAppointmentsStats {
  total: number;
  completed: number;
  cancelled: number;
  scheduled: number;
}

export interface DoctorAppointmentsDailyData {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
}

export interface DoctorAppointmentsTopPatient {
  patientId: number;
  patientName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  lastAppointmentDate: string;
}

export interface DoctorAppointmentsResponse {
  message: string;
  data: {
    meta: {
      from: string;
      to: string;
    };
    stats: DoctorAppointmentsStats;
    dailyData: DoctorAppointmentsDailyData[];
    topPatients: DoctorAppointmentsTopPatient[];
  };
}
