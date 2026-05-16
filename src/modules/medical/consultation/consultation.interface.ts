export interface CreateConsultationDto {
    invoiceId: number;
    doctorId: number;
}

export interface UpdateConsultationDto {
    doctorId?: number;
    date?: string | Date;
    started_at?: string | Date;
    finished_at?: string | Date;
    status?: "PENDING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
    symptoms?: string;
    diagnosis?: string;
    physical_exam?: string;
}

export interface FinishConsultationSupplyDto {
    supplyId: number;
    quantity: string | number;
}

export interface FinishConsultationPrescriptionDto {
    supplyId?: number;
    medication_name?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
    active?: boolean;
}

export interface FinishConsultationSymptomDto {
    symptomId: number;
    severity: string;
    duration: string;
    notes?: string;
}

export interface FinishConsultationClinicalExaminationDto {
    weight?: string | number;
    height?: string | number;
    temperature?: string | number;
    systolic_bp?: number;
    diastolic_bp?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    oxygen_saturation?: string | number;
}

export interface FinishConsultationDiagnosisDto {
    diagnosisId: number;
    is_primary: boolean;
    condition_status?: string;
    onset_date?: string | Date;
}

export interface FinishConsultationDto {
    finished_at?: string | Date;

    supplies: FinishConsultationSupplyDto[];
    prescriptions: FinishConsultationPrescriptionDto[];
    symptomsConsultas: FinishConsultationSymptomDto[];
    clinicalExaminations: FinishConsultationClinicalExaminationDto[];
    consultationDiagnoses: FinishConsultationDiagnosisDto[];
}
