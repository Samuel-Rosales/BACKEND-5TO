import { Request, Response } from "express";
import { UserService } from "./user.service";

const service = new UserService();

export class UserController {

    async create(req: Request, res: Response) {
        const data = req.body;

        const { data: createdUser, status, message, error } = await service.create(data);

        return res.status(status).json({ message, data: createdUser, error });
    }

    async findAll(req: Request, res: Response) {
        const { data, status, message, error } = await service.findAll();

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

        const { data: updatedUser, status, message, error } = await service.update(Number(id), data);

        return res.status(status).json({ message, data: updatedUser, error });
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.delete(Number(id));

        return res.status(status).json({ message, data, error });
    }
}
