import { prisma } from '@/configs';
import { ClinicalReportQuery, ClinicalReportResponse } from './clinicalReport.interface';

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export class ClinicalReportService {
  async getClinicalReport(query: ClinicalReportQuery): Promise<ClinicalReportResponse> {
    const from = query.from ?? new Date().toISOString().slice(0, 10);
    const to = query.to ?? from;
    const doctorId = query.doctorId ?? 0;

    const [consultations, patients, exams] = await Promise.all([
      prisma.consultation.count({
        where: {
          date: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T23:59:59.999Z`) },
          ...(doctorId ? { doctorId } : {}),
        },
      }),
      prisma.patient.count({
        where: {
          createdAt: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T23:59:59.999Z`) },
        },
      }),
      prisma.clinicalExamination.count({
        where: {
          created_at: { gte: new Date(`${from}T00:00:00.000Z`), lte: new Date(`${to}T23:59:59.999Z`) },
          ...(doctorId ? { consultation: { doctorId } } : {}),
        },
      }),
    ]);

    return {
      message: 'Reporte clínico encontrado exitosamente',
      data: {
        meta: { from, to, doctorId },
        stats: {
          totalConsultations: consultations,
          newPatients: patients,
          examsPerformed: exams,
          consultationsGrowth: 0,
          patientsGrowth: 0,
          examsGrowth: 0,
        },
        pathologies: [],
        recentDiagnoses: [],
      },
    };
  }
}
