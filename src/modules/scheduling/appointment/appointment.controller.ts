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
        console.log("id doctor header", req.header("x-doctor-id"));
        console.log("id doctor param", id);
        const range = (req.query.range ?? req.query.rango ?? req.query.filter) !== undefined
            ? String(req.query.range ?? req.query.rango ?? req.query.filter)
            : undefined;
        const doctorIdHeader = req.header("x-doctor-id") ?? undefined;
        const statusId = req.query?.statusId ? Number(req.query.statusId) : undefined;

        const doctorIdFinal = id ?? doctorIdHeader;
        const doctorIdNumber = Number(doctorIdFinal);
        if (!Number.isFinite(doctorIdNumber) || doctorIdNumber <= 0) {
            return res.status(400).json({
                message: "doctorId inválido",
                data: null,
                error: "Validación",
            });
        }

        const { data, status, message, error } = await service.findManyByDr(doctorIdNumber, { range, statusId });

        return res.status(status).json({ message, data, error });
    }

    async getDoctorStats(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.getDoctorStats(Number(id));

        return res.status(status).json({ message, data, error });
    }

    async findByPatientId(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.findByPatientId(Number(id));

        return res.status(status).json({ message, data, error });
    }

    async getWeeklyFlowByDoctor(req: Request, res: Response) {
        const { id } = req.params;
        const doctorIdHeader = req.header("x-doctor-id") ?? undefined;
        const range = (req.query.range ?? req.query.rango ?? req.query.filter) !== undefined
            ? String(req.query.range ?? req.query.rango ?? req.query.filter)
            : undefined;

        const doctorIdFinal = id ?? doctorIdHeader;
        const doctorIdNumber = Number(doctorIdFinal);
        if (!Number.isFinite(doctorIdNumber) || doctorIdNumber <= 0) {
            return res.status(400).json({
                message: "doctorId inválido",
                data: null,
                error: "Validación",
            });
        }

        const { data, status, message, error } = await service.getWeeklyFlowByDoctor(doctorIdNumber, range);

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
