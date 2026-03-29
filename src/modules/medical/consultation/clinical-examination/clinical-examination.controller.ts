import { Request, Response } from "express";
import { ClinicalExaminationService } from "./clinical-examination.service";

const service = new ClinicalExaminationService();

export class ClinicalExaminationController {
    async list(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.list(Number(id));

        return res.status(status).json({ message, data, error });
    }

    async create(req: Request, res: Response) {
        const { id } = req.params;
        const data = req.body;

        const { data: created, status, message, error } = await service.create(Number(id), data);

        return res.status(status).json({ message, data: created, error });
    }

    async update(req: Request, res: Response) {
        const { id, clinicalExaminationId } = req.params;
        const data = req.body;

        const { data: updated, status, message, error } = await service.update(
            Number(id),
            Number(clinicalExaminationId),
            data
        );

        return res.status(status).json({ message, data: updated, error });
    }

    async delete(req: Request, res: Response) {
        const { id, clinicalExaminationId } = req.params;

        const { data, status, message, error } = await service.delete(Number(id), Number(clinicalExaminationId));

        return res.status(status).json({ message, data, error });
    }
}
