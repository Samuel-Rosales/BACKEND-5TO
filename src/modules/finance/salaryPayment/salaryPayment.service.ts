import { prisma } from '@/configs';
import { CreateSalaryPaymentDto, UpdateSalaryPaymentDto } from './salaryPayment.interface';

const salaryPaymentSelect = {
  id: true,
  payrollId: true,
  userId: true,
  amount: true,
  concept: true,
  date_at: true,
  payroll: {
    select: {
      id: true,
      period_start: true,
      period_end: true,
      status: true,
      created_at: true,
    },
  },
  user: {
    select: {
      id: true,
      ci: true,
      name: true,
      role: {
        select: {
          id: true,
          name: true,
          code: true,
          base_salary: true,
        },
      },
    },
  },
} as const;

const resolveAmount = async (userId: number, amount?: number | string) => {
  if (amount !== undefined && amount !== null && amount !== '') return Number(amount);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: { select: { base_salary: true } },
    },
  });

  return Number(user?.role?.base_salary ?? 0);
};

export class SalaryPaymentService {
  async create(data: CreateSalaryPaymentDto) {
    try {
      const created = await prisma.salaryPayment.create({
        data: {
          payrollId: Number(data.payrollId),
          userId: Number(data.userId),
          amount: await resolveAmount(Number(data.userId), data.amount),
          concept: data.concept ?? null,
          date_at: data.date_at ? new Date(data.date_at) : new Date(),
        },
        select: salaryPaymentSelect,
      });

      return { status: 201, message: 'Pago salarial creado éxitosamente', data: created };
    } catch (error) {
      console.error('Error creando el pago salarial:', error);
      return {
        status: 500,
        message: 'Error interno al crear el pago salarial',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  async findAll() {
    try {
      const items = await prisma.salaryPayment.findMany({
        orderBy: { id: 'desc' },
        select: salaryPaymentSelect,
      });

      return {
        status: 200,
        message: items.length === 0 ? 'No se encontraron pagos salariales' : 'Pagos salariales encontrados éxitosamente',
        data: items,
      };
    } catch (error) {
      console.error('Error buscando pagos salariales:', error);
      return {
        status: 500,
        message: 'Error interno al buscar pagos salariales',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  async findOne(id: number) {
    try {
      const item = await prisma.salaryPayment.findUnique({
        where: { id },
        select: salaryPaymentSelect,
      });

      return { status: 200, message: 'Pago salarial encontrado éxitosamente', data: item };
    } catch (error) {
      console.error('Error buscando pago salarial:', error);
      return {
        status: 500,
        message: 'Error interno al buscar pago salarial',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  async update(id: number, data: UpdateSalaryPaymentDto) {
    try {
      const updated = await prisma.salaryPayment.update({
        where: { id },
        data: {
          ...(data.payrollId !== undefined ? { payrollId: Number(data.payrollId) } : {}),
          ...(data.userId !== undefined ? { userId: Number(data.userId) } : {}),
          ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}),
          ...(data.concept !== undefined ? { concept: data.concept } : {}),
          ...(data.date_at !== undefined ? { date_at: new Date(data.date_at) } : {}),
        },
        select: salaryPaymentSelect,
      });

      return { status: 200, message: 'Pago salarial actualizado éxitosamente', data: updated };
    } catch (error) {
      console.error('Error actualizando pago salarial:', error);
      return {
        status: 500,
        message: 'Error interno al actualizar pago salarial',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  async delete(id: number) {
    try {
      const deleted = await prisma.salaryPayment.delete({
        where: { id },
        select: salaryPaymentSelect,
      });

      return { status: 200, message: 'Pago salarial eliminado éxitosamente', data: deleted };
    } catch (error) {
      console.error('Error eliminando pago salarial:', error);
      return {
        status: 500,
        message: 'Error interno al eliminar pago salarial',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}
