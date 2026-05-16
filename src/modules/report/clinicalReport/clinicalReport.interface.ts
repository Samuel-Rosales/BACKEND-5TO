export interface ClinicalReportQuery {
  from?: string;
  to?: string;
  doctorId?: number;
}

export interface ClinicalReportStats {
  totalConsultations: number;
  newPatients: number;
  examsPerformed: number;
  consultationsGrowth: number;
  patientsGrowth: number;
  examsGrowth: number;
}

export interface PathologyData {
  name: string;
  total: number;
  percentage: number;
  color?: string;
}

export interface RecentDiagnosis {
  id: number;
  patientName: string;
  diagnosis: string;
  date: string;
  status: 'confirmed' | 'pending' | 'rejected';
}

export interface ClinicalReportResponse {
  message: string;
  data: {
    meta: {
      from: string;
      to: string;
      doctorId: number;
    };
    stats: ClinicalReportStats;
    pathologies: PathologyData[];
    recentDiagnoses: RecentDiagnosis[];
  };
}
