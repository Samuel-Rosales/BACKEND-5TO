import { Request, Response } from "express";
import { SymptomsService } from "./symptoms.service";

const service = new SymptomsService();

export class SymptomsController {
    async findAll(req: Request, res: Response) {
        const { search } = req.query;
        const { data, status, message, error } = await service.findAll(search as string);

        return res.status(status).json({ message, data, error });
    }
}
