import { Request, Response } from "express";
import { DoctorScheduleService } from "./doctorSchedule.service";

const service = new DoctorScheduleService();

export class DoctorScheduleController {

    async create(req: Request, res: Response) {
        const data = req.body;

        const { data: created, status, message, error } = await service.create(data);

        return res.status(status).json({ message, data: created, error });
    }

    async findAll(req: Request, res: Response) {
        const doctorId = req.query.doctorId ? Number(req.query.doctorId) : undefined;
        const periodEnd = req.query.periodEnd ? String(req.query.periodEnd) : undefined;
        
        const doctorOnly = req?.body?.doctorOnly; 

        const { data, status, message, error } = await service.findAll({ doctorId, periodEnd }, doctorOnly);

        return res.status(status).json({ message, data, error });
    }

    /*async findAllByDoctor(req: Request, res: Response) {
        const doctorId = Number(req.params.doctorId);

        const { data, status, message, error } = await service.findAllByDoctor(doctorId);

        return res.status(status).json({ message, data, error });
    }*/

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
