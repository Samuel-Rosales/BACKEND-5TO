import { Request, Response } from "express";
import { DoctorAvailabilityService } from "./doctorAvailability.service";

const service = new DoctorAvailabilityService();

export class DoctorAvailabilityController {

    async create(req: Request, res: Response) {
        const data = req.body;

        const { data: created, status, message, error } = await service.create(data);

        return res.status(status).json({ message, data: created, error });
    }

    async findAll(req: Request, res: Response) {
        const doctorId = req.query.doctorId ? Number(req.query.doctorId) : undefined;
        const doctorScheduleId = req.query.doctorScheduleId ? Number(req.query.doctorScheduleId) : undefined;
        const specialtyId = req.query.specialtyId ? Number(req.query.specialtyId) : undefined;
        const day_of_week = req.query.day_of_week !== undefined ? Number(req.query.day_of_week) : undefined;
        const morning = req.query.morning !== undefined ? String(req.query.morning) === "true" : undefined;
        const date = req.query.date !== undefined ? String(req.query.date) : undefined;

        const { data, status, message, error } = await service.findAll({
            doctorId,
            doctorScheduleId,
            specialtyId,
            day_of_week,
            morning,
            date,
        });

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
