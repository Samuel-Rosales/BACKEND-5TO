import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt.util';
import { prisma } from '@/configs';

// Extendemos la interfaz de Express para que req.user exista
declare global {
  namespace Express {
    interface Request {
      user?: any; // Aquí guardaremos los datos del usuario decodificado
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado. Token faltante.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado.' });

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: 'No autorizado.' });
  }
};