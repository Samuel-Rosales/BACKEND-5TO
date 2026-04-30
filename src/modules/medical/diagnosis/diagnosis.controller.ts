import { Request, Response } from "express";
import { DiagnosisService } from "./diagnosis.service";

const service = new DiagnosisService();

export class DiagnosisController {
    async findAll(req: Request, res: Response) {
        const { search } = req.query;
        const { data, status, message, error } = await service.findAll(search as string);

        return res.status(status).json({ message, data, error });
    }
}
