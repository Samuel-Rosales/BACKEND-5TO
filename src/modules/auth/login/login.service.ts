import { prisma } from '@/configs';
import { LoginInterface } from './login.interface';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/utils/jwt.util';

export class AuthService {

    async login(data: LoginInterface) {
        try {
            // 1. Buscar usuario por email
            const user = await prisma.user.findUnique({
                where: { ci: data.ci },
            });

            if (!user) {
                return {
                    status: 401,
                    message: 'Credenciales inválidas', // No digas "usuario no existe" por seguridad
                    data: null
                };
            }

            // 2. Comparar contraseñas (Hash vs Texto plano)
            const isMatch = await bcrypt.compare(data.password, user.password);

            if (!isMatch) {
                return {
                    status: 401,
                    message: 'Credenciales inválidas, esa es la contraseña de juansun77@gmail.com', // Mensaje genérico por seguridad
                    data: null
                };
            }

            // 3. Generar Token
            // Guardamos el ID del usuario en el token.
            // OJO: No guardamos el businessId todavía, porque el usuario debe ELEGIR a qué empresa entrar.
            const token = generateToken({ id: user.id, ci: user.ci });

            // 4. Retornar datos (Excluyendo contraseña)
            const { password, ...userWithoutPass } = user;

            return {
                status: 200,
                message: 'Inicio de sesión exitoso',
                data: {
                    user: userWithoutPass,
                    token
                }
            };
        } catch (error) {
            console.error(error);

            return {
                status: 500,
                message: 'Error interno del servidor',
                data: null
            };
        }
    }

    async getMe(userId: number) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    ci: true,
                    name: true,      
                }
            });

            if (!user) {
                return {
                    message: 'Usuario no encontrado o inactivo',
                    status: 404,
                    data: null
                };
            }

            // Mapeo opcional si tu frontend espera firstName/lastName pero tu DB tiene 'name'
            // const formattedUser = {
            //    ...user,
            //    firstName: user.name.split(' ')[0],
            //    lastName: user.name.split(' ').slice(1).join(' ') || ''
            // };

            return {
                message: 'Perfil de usuario obtenido',
                status: 200,
                data: user // o formattedUser
            };

        } catch (error) {
            console.error('Error en getMe:', error);
            return {
                message: 'Error interno del servidor',
                status: 500,
                data: null
            };
        }
    }
}