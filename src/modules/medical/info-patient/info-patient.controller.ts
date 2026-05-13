import { Request, Response } from "express";
import { InfoPatientService } from "./info-patient.service";

const service = new InfoPatientService();

export class InfoPatientController {
    async create(req: Request, res: Response) {
        const patientId = Number(req.params.patientId);
        const data = req.body;

        const { data: created, status, message, error } = await service.create(data, patientId);

        return res.status(status).json({ message, data: created, error });
    }

    async findAll(req: Request, res: Response) {
        const { data, status, message, error } = await service.findAll();

        return res.status(status).json({ message, data, error });
    }

    async findByPatientId(req: Request, res: Response) {
        const patientId = Number(req.params.patientId);
        
        const { data, status, message, error } = await service.findByPatientId(patientId);

        return res.status(status).json({ message, data, error });
    }

    async updateByPatientId(req: Request, res: Response) {
        const patientId = Number(req.params.patientId);
        const data = req.body;

        const { data: updated, status, message, error } = await service.updateByPatientId(patientId, data);

        return res.status(status).json({ message, data: updated, error });
    }

    async deleteByPatientId(req: Request, res: Response) {
        const patientId = Number(req.params.patientId);

        const { data: deleted, status, message, error } = await service.deleteByPatientId(patientId);

        return res.status(status).json({ message, data: deleted, error });
    }
}