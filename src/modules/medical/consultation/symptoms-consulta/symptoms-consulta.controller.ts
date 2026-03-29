import { Request, Response } from "express";
import { SymptomsConsultaService } from "./symptoms-consulta.service";

const service = new SymptomsConsultaService();

export class SymptomsConsultaController {
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
        const { id, symptomsConsultaId } = req.params;
        const data = req.body;

        const { data: updated, status, message, error } = await service.update(
            Number(id),
            Number(symptomsConsultaId),
            data
        );

        return res.status(status).json({ message, data: updated, error });
    }

    async delete(req: Request, res: Response) {
        const { id, symptomsConsultaId } = req.params;

        const { data, status, message, error } = await service.delete(Number(id), Number(symptomsConsultaId));

        return res.status(status).json({ message, data, error });
    }
}
