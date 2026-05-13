import { Request, Response } from 'express';
import { RegisterService } from './register.service';

export class AuthController {
    private service = new RegisterService();

    register = async (req: Request, res: Response) => {

        const { status, message, data, error } = await this.service.registerUser(req.body);

        return res.status(status).json({
            data,
            message,
            error,
        });
    }
}