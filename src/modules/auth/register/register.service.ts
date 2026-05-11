import { prisma } from '@/configs';
import { RegisterInterface } from './register.interface';
import { CreateUserDto } from '../user/user.interface';
import { UserService } from '../user/user.service';
import { PatientService } from '../../medical/patient/patient.service';

const userService = new UserService();
const patientService = new PatientService();

export class RegisterService {
    async registerUser (data: RegisterInterface) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { ci: data.ci },
            });

            if (existingUser) {
                return {
                    status: 400,
                    message: "El CI ya está registrado",
                    data: null,
                };
            }

            const defaultRole = await prisma.role.findFirst({
                where: { code: "PATIENT", active: true },
            });


            if (!defaultRole) {
                return {
                    status: 500,
                    message: "Error interno al crear el usuario",
                    error: "Rol por defecto no encontrado",
                    data: null,
                };
            }

            const createUserDto: CreateUserDto = {
                ci: data.ci,
                name: data.name,
                password: data.password,
                roleId: defaultRole.id,
            };

            const createdUserResult = await userService.create(createUserDto);
            const newUser = createdUserResult.data;

            if (!newUser) {
                return {
                    status: createdUserResult.status ?? 500,
                    message: createdUserResult.message ?? "Error interno al crear el usuario",
                    error: createdUserResult.error ?? "No se pudo crear el usuario",
                    data: null,
                };
            }

            const createdPatientResult = await patientService.create({
                userId: newUser.id,
            });

            if (!createdPatientResult || createdPatientResult.status !== 201) {
                return {
                    status: createdPatientResult?.status ?? 500,
                    message: createdPatientResult?.message ?? "Error interno al crear el paciente",
                    error: (createdPatientResult as any)?.error,
                    data: null,
                };
            }

            return  {
                status: 201,
                message: 'Usuario/paciente registrado exitosamente ',
                data: null,
            };

        } catch (error) {
            return {
                status: 500,
                message: 'Error al registrar el usuario',
                data: null,
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    };
}


