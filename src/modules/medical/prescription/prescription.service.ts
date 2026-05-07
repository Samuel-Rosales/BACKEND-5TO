import { prisma } from "@/configs";
import { CreatePrescriptionDto, UpdatePrescriptionDto } from "./prescription.interface";

const prescriptionSelect = {
    id: true,
    consultationId: true,
    supplyId: true,
    medication_name: true,
    dosage: true,
    frequency: true,
    duration: true,
    instructions: true,
    supply: {
        select: {
            id: true,
            name: true,
            sku: true,
        },
    },
} as const;

export class PrescriptionService {

    async create(data: CreatePrescriptionDto) {
        try {
            const prescription = await prisma.prescription.create({
                data,
                select: prescriptionSelect,
            });

            if (!prescription) {
                throw new Error("Error creando la prescripción");
            }

            return {
                status: 201,
                message: "Prescripción creada éxitosamente",
                data: prescription,
            };
        } catch (error) {
            console.error("Error creando la prescripción:", error);

            return {
                status: 500,
                message: "Error interno al crear la prescripción",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findAll() {
        try {
            const prescriptions = await prisma.prescription.findMany({
                orderBy: { id: "desc" },
                select: prescriptionSelect,
            });

            if (!prescriptions) {
                throw new Error("Error buscando prescripciones");
            }

            if (prescriptions.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron prescripciones",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Prescripciones encontradas éxitosamente",
                data: prescriptions,
            };
        } catch (error) {
            console.error("Error buscando prescripciones:", error);

            return {
                status: 500,
                message: "Error interno al buscar las prescripciones",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findByPatientId(patientId: number) {
        try {
            const consultations = await prisma.consultation.findMany({
                where: {
                    invoice: {
                        patientId,
                    },
                },
                select: {
                    id: true,
                },
            });

            const consultationIds = consultations.map(c => c.id);

            const prescriptions = await prisma.prescription.findMany({
                where: {
                    consultationId: {
                        in: consultationIds,
                    },
                },
                orderBy: { id: "desc" },
                select: {
                    ...prescriptionSelect,
                    consultation: {
                        select: {
                            id: true,
                            date: true,
                            doctor: {
                                select: {
                                    user: {
                                        select: { name: true },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!prescriptions) {
                throw new Error("Error buscando prescripciones");
            }

            if (prescriptions.length === 0) {
                return {
                    status: 200,
                    message: "No se encontraron prescripciones para el paciente",
                    data: [],
                };
            }

            return {
                status: 200,
                message: "Prescripciones encontradas éxitosamente",
                data: prescriptions,
            };
        } catch (error) {
            console.error("Error buscando prescripciones:", error);

            return {
                status: 500,
                message: "Error interno al buscar las prescripciones",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async findOne(id: number) {
        try {
            const prescription = await prisma.prescription.findUnique({
                where: { id },
                select: prescriptionSelect,
            });

            if (!prescription) {
                throw new Error("Error buscando la prescripción");
            }

            return {
                status: 200,
                message: "Prescripción encontrada éxitosamente",
                data: prescription,
            };
        } catch (error) {
            console.error("Error buscando la prescripción:", error);

            return {
                status: 500,
                message: "Error interno al buscar la prescripción",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async update(id: number, data: UpdatePrescriptionDto) {
        try {
            const prescription = await prisma.prescription.update({
                where: { id },
                data,
                select: prescriptionSelect,
            });

            if (!prescription) {
                throw new Error("Error actualizando la prescripción");
            }

            return {
                status: 200,
                message: "Prescripción actualizada éxitosamente",
                data: prescription,
            };
        } catch (error) {
            console.error("Error actualizando la prescripción:", error);

            return {
                status: 500,
                message: "Error interno al actualizar la prescripción",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    async delete(id: number) {
        try {
            const prescription = await prisma.prescription.delete({
                where: { id },
                select: prescriptionSelect,
            });

            if (!prescription) {
                throw new Error("Error eliminando la prescripción");
            }

            return {
                status: 200,
                message: "Prescripción eliminada éxitosamente",
                data: prescription,
            };
        } catch (error) {
            console.error("Error eliminando la prescripción:", error);

            return {
                status: 500,
                message: "Error interno al eliminar la prescripción",
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}
