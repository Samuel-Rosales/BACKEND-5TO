import { Request, Response } from "express";
import { InvoiceService } from "./invoice.service";

const service = new InvoiceService();

export class InvoiceController {

    async create(req: Request, res: Response) {
        const data = req.body;

        const { data: created, status, message, error } = await service.create(data);

        return res.status(status).json({ message, data: created, error });
    }

    async findAll(req: Request, res: Response) {
        const { data, status, message, error } = await service.findAll();

        return res.status(status).json({ message, data, error });
    }

    // async findOne(req: Request, res: Response) {
    //     const { id } = req.params;

    //     const { data, status, message, error } = await service.findOne(Number(id));

    //     return res.status(status).json({ message, data, error });
    // }

    // async update(req: Request, res: Response) {
    //     const { id } = req.params;
    //     const data = req.body;

    //     const { data: updated, status, message, error } = await service.update(Number(id), data);

    //     return res.status(status).json({ message, data: updated, error });
    // }

    // async delete(req: Request, res: Response) {
    //     const { id } = req.params;

    //     const { data, status, message, error } = await service.delete(Number(id));

    //     return res.status(status).json({ message, data, error });
    // }
}
