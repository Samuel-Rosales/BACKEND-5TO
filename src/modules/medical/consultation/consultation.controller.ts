import { Request, Response } from "express";
import { ConsultationService } from "./consultation.service";

const service = new ConsultationService();

export class ConsultationController {

    async create(req: Request, res: Response) {
        const data = req.body;

        const { data: created, status, message, error } = await service.create(data);

        return res.status(status).json({ message, data: created, error });
    }

    async findAll(req: Request, res: Response) {
        const { data, status, message, error } = await service.findAll();

        return res.status(status).json({ message, data, error });
    }

    async findAllByDoctor(req: Request, res: Response) {
        const { id } = req.params;
        const doctorIdHeader = req.header("x-doctor-id") ?? undefined;

        const doctorIdFinal = id ?? doctorIdHeader;

        const doctorIdNumber = Number(doctorIdFinal);
        if (!Number.isFinite(doctorIdNumber) || doctorIdNumber <= 0) {
            return res.status(400).json({
                message: "doctorId inválido",
                data: null,
                error: "Validación",
            });
        }

        const { data, status, message, error } = await service.findAllByDoctor(doctorIdNumber);

        return res.status(status).json({ message, data, error });
    }


    async findOne(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.findOne(Number(id));

        return res.status(status).json({ message, data, error });
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data = req.body;

        const { data: updated, status, message, error } = await service.update(Number(id), data);

        return res.status(status).json({ message, data: updated, error });
    }

    async finish(req: Request, res: Response) {
        const { id } = req.params;
        const data = req.body;

        const { data: finished, status, message, error } = await service.finish(Number(id), data);

        return res.status(status).json({ message, data: finished, error });
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.delete(Number(id));

        return res.status(status).json({ message, data, error });
    }
}
