import { Request, Response } from "express";
import { PatientService } from "./patient.service";

const service = new PatientService();

export class PatientController {

    async create(req: Request, res: Response) {
        const data = req.body;
        
        const userId = req.user?.id;

        const { data: created, status, message, error } = await service.create(data, userId);

        return res.status(status).json({ message, data: created, error });
    }

    async findAll(req: Request, res: Response) {
        const { ci, name, page, limit, userId } = req.query;
        
        const params = {
            ci: ci as string,
            name: name as string,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            userId: userId ? parseInt(userId as string) : undefined,
        };

        const result = await service.findAll(params);
        
        if (result.pagination) {
            return res.status(result.status).json({ 
                message: result.message, 
                data: result.data, 
                pagination: result.pagination,
                error: result.error 
            });
        }

        return res.status(result.status).json({ message: result.message, data: result.data, error: result.error });
    }

    async findAllFromUser(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.findAllFromUser(Number(id));

        return res.status(status).json({ message, data, error });
    }

    async findByCI(req: Request, res: Response) {
        const ciParam = req.params.ci;
        const ci = Array.isArray(ciParam) ? ciParam[0] : ciParam;

        const { data, status, message, error } = await service.findByCI(ci);

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
