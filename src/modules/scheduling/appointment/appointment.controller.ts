import { Request, Response } from "express";
import { AppointmentService } from "./appointment.service";

const service = new AppointmentService();

export class AppointmentController {

    async create(req: Request, res: Response) {
        const data = req.body;

        const { data: created, status, message, error } = await service.create(data);

        return res.status(status).json({ message, data: created, error });
    }

    async findAll(req: Request, res: Response) {
        const range = (req.query.range ?? req.query.rango ?? req.query.filter) !== undefined
            ? String(req.query.range ?? req.query.rango ?? req.query.filter)
            : undefined;
        const statusId = req.query?.statusId ? Number(req.query.statusId) : undefined;

        const { data, status, message, error } = await service.findAll({ range, statusId });

        return res.status(status).json({ message, data, error });
    }

    async findManyByDr(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.findManyByDr(Number(id));

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

    async delete(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.delete(Number(id));

        return res.status(status).json({ message, data, error });
    }
}
