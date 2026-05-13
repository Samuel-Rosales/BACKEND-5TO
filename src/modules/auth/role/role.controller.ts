import { Request, Response} from "express";
import { RoleService } from "./role.service";

const service = new RoleService();

export class RoleController {

    async create(req: Request, res: Response) {
        const data = req.body;

       const { data: createdRole, status, message, error } = await service.create(data);

        return res.status(status).json({ message, data: createdRole, error });
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

        const { data: updatedRole, status, message, error } = await service.update(Number(id), data);

        return res.status(status).json({ message, data: updatedRole, error });
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;

        const { data, status, message, error } = await service.delete(Number(id));

        return res.status(status).json({ message, data, error });
    }
}