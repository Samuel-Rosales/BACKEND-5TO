import { prisma } from '@/configs';
import {
  CreateSalaryPaymentDto,
  PendingSalaryBreakdownItemDto,
  PendingSalarySummaryItemDto,
  PendingSalarySummaryResultDto,
  UpdateSalaryPaymentDto,
} from './salaryPayment.interface';

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const salaryPaymentSelect = {
  id: true,
  payrollId: true,
  userId: true,
  amount: true,
  concept: true,
  date_at: true,
  payrollPayments: {
    select: {
      id: true,
      amount: true,
      payrollLine: {
        select: {
          id: true,
          consultationId: true,
          base_amount: true,
          commission_percentage: true,
          payroll: {
            select: {
              id: true,
              period_start: true,
              period_end: true,
              status: true,
            },
          },
          consultation: {
            select: {
              id: true,
              doctorId: true,
              date: true,
              doctor: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
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

const getCurrentMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const getMonthlyPayrollPeriod = (referenceDate: Date) => {
  const periodStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1, 0, 0, 0, 0);
  const periodEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return { periodStart, periodEnd };
};

const isLastDayOfMonth = (date: Date) => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return date.getFullYear() === lastDay.getFullYear() && date.getMonth() === lastDay.getMonth() && date.getDate() === lastDay.getDate();
};

const toMoney = (value: unknown) => money(Number(value ?? 0));

const getPendingPayrollLines = async (userId: number, payrollId: number) => {
  return prisma.payrollLine.findMany({
    where: {
      payrollId,
      consultation: {
        doctor: {
          userId,
        },
      },
      payrollPayments: {
        none: {},
      },
    },
    orderBy: { id: 'asc' },
    include: {
      consultation: {
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
        },
      },
      payroll: true,
    },
  });
};

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

const buildPendingBreakdownForPayrollLine = (line: {
  id: number;
  base_amount: unknown;
  commission_percentage: unknown;
  consultation: {
    id: number;
    invoiceId: number;
    doctor: {
      id: number;
      user: {
        name: string;
      };
      specialty: {
        name: string;
      };
    };
  };
}): PendingSalaryBreakdownItemDto => {
  const amount = money(Number(line.base_amount) * (Number(line.commission_percentage) / 100));

  return {
    type: 'PAYROLL_LINE',
    label: `Consulta #${line.consultation.id} · Factura #${line.consultation.invoiceId}`,
    amount,
    payrollLineId: line.id,
    consultationId: line.consultation.id,
    invoiceId: line.consultation.invoiceId,
    doctorId: line.consultation.doctor.id,
    doctorName: line.consultation.doctor.user.name,
    specialtyName: line.consultation.doctor.specialty.name,
    baseAmount: Number(line.base_amount),
    commissionPercentage: Number(line.commission_percentage),
  };
};

export class SalaryPaymentService {
  async getPendingSummary(referenceDate = new Date()): Promise<{ status: number; message: string; data: PendingSalarySummaryResultDto }> {
    try {
      const { periodStart, periodEnd } = getMonthlyPayrollPeriod(referenceDate);

      const payroll = await prisma.payroll.findFirst({
        where: {
          period_start: periodStart,
          period_end: periodEnd,
        },
        select: {
          id: true,
          period_start: true,
          period_end: true,
          status: true,
        },
      });

      if (!payroll) {
        return {
          status: 200,
          message: 'No hay nómina creada para el periodo actual',
          data: { payroll: null, items: [], totalAmount: 0, totalUsers: 0 },
        };
      }

      if (payroll.status.trim().toUpperCase() === 'PAID') {
        return {
          status: 200,
          message: 'La nómina ya fue pagada',
          data: {
            payroll,
            items: [],
            totalAmount: 0,
            totalUsers: 0,
          },
        };
      }

      const [pendingPayrollLines, salaryPayments, salaryRoles] = await Promise.all([
        prisma.payrollLine.findMany({
          where: {
            payrollId: payroll.id,
            payrollPayments: { none: {} },
          },
          include: {
            consultation: {
              include: {
                doctor: {
                  include: {
                    user: true,
                    specialty: true,
                  },
                },
              },
            },
          },
          orderBy: { id: 'asc' },
        }),
        prisma.salaryPayment.findMany({
          where: {
            payrollId: payroll.id,
          },
          select: {
            userId: true,
          },
        }),
        prisma.user.findMany({
          where: {
            active: true,
            role: {
              base_salary: {
                not: null,
              },
            },
          },
          select: {
            id: true,
            ci: true,
            name: true,
            role: {
              select: {
                name: true,
                code: true,
                base_salary: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        }),
      ]);

      const paidUserIds = new Set(salaryPayments.map((payment) => payment.userId));
      const doctorMap = new Map<number, PendingSalarySummaryItemDto>();

      for (const line of pendingPayrollLines) {
        const userId = line.consultation.doctor.user.id;
        const amount = money(Number(line.base_amount) * (Number(line.commission_percentage) / 100));
        const current = doctorMap.get(userId);
        const breakdown = buildPendingBreakdownForPayrollLine(line);

        if (current) {
          current.amount = money(current.amount + amount);
          current.breakdown.push(breakdown);
          continue;
        }

        doctorMap.set(userId, {
          userId,
          userName: line.consultation.doctor.user.name,
          ci: line.consultation.doctor.user.ci,
          roleName: 'Médico',
          roleCode: 'DOCTOR',
          payrollId: payroll.id,
          amount,
          type: 'DOCTOR',
          breakdown: [breakdown],
        });
      }

      for (const user of salaryRoles) {
        const baseSalary = money(Number(user.role?.base_salary ?? 0));
        if (!baseSalary) continue;

        if (doctorMap.has(user.id) || paidUserIds.has(user.id)) continue;

        doctorMap.set(user.id, {
          userId: user.id,
          userName: user.name,
          ci: user.ci,
          roleName: user.role?.name ?? 'Rol',
          roleCode: user.role?.code ?? 'ROLE',
          payrollId: payroll.id,
          amount: baseSalary,
          type: 'SALARY',
          breakdown: [
            {
              type: 'BASE_SALARY',
              label: `Sueldo base del rol ${user.role?.name ?? ''}`.trim(),
              amount: baseSalary,
            },
          ],
        });
      }

      const items = Array.from(doctorMap.values()).sort((left, right) => left.userName.localeCompare(right.userName));
      const totalAmount = money(items.reduce((sum, item) => sum + item.amount, 0));

      return {
        status: 200,
        message: 'Resumen de pagos pendientes encontrado éxitosamente',
        data: {
          payroll,
          items,
          totalAmount,
          totalUsers: items.length,
        },
      };
    } catch (error) {
      console.error('Error obteniendo resumen de pagos pendientes:', error);
      return {
        status: 500,
        message: 'Error interno al buscar resumen de pagos pendientes',
        data: { payroll: null, items: [], totalAmount: 0, totalUsers: 0 },
      };
    }
  }

  async create(data: CreateSalaryPaymentDto) {
    try {
      const payrollId = Number(data.payrollId);
      const userId = Number(data.userId);
      const paymentDate = data.date_at ? new Date(data.date_at) : new Date();
      const requestedAmount = data.amount !== undefined && data.amount !== null && data.amount !== '' ? money(Number(data.amount)) : null;

      const payroll = await prisma.payroll.findUnique({
        where: { id: payrollId },
        select: { id: true, period_start: true, period_end: true, status: true },
      });

      if (!payroll) {
        throw new Error('La nómina no existe');
      }

      if (!isLastDayOfMonth(paymentDate)) {
        throw new Error('Solo se puede pagar la nómina el último día del mes');
      }

      const { start, end } = getCurrentMonthRange(paymentDate);
      if (payroll.period_start.getTime() !== start.getTime() || payroll.period_end.getTime() !== end.getTime()) {
        throw new Error('Solo se puede pagar la nómina del mes actual');
      }

      const pendingLines = await getPendingPayrollLines(userId, payrollId);
      const existingPayment = await prisma.salaryPayment.findFirst({
        where: { payrollId, userId },
        select: { id: true },
      });

      if (existingPayment) {
        throw new Error('Ya existe un pago salarial para este usuario en la nómina seleccionada');
      }

      const salaryBase = money(await resolveAmount(userId));
      const isDoctorPayroll = pendingLines.length > 0;
      const pendingTotal = isDoctorPayroll
        ? money(pendingLines.reduce((sum, line) => sum + Number(line.base_amount) * (Number(line.commission_percentage) / 100), 0))
        : salaryBase;
      const amount = requestedAmount ?? pendingTotal;

      if (pendingTotal <= 0) {
        throw new Error('No hay monto pendiente para este usuario en la nómina seleccionada');
      }

      if (requestedAmount !== null && money(amount) !== pendingTotal) {
        throw new Error(`El monto debe coincidir exactamente con el pendiente del mes: ${pendingTotal.toFixed(2)}`);
      }

      const created = await prisma.$transaction(async (tx) => {
        const salaryPayment = await tx.salaryPayment.create({
          data: {
            payrollId,
            userId,
            amount,
            concept: data.concept ?? null,
            date_at: paymentDate,
          },
          select: salaryPaymentSelect,
        });

        if (pendingLines.length > 0) {
          let allocatedSoFar = 0;
          for (let i = 0; i < pendingLines.length; i += 1) {
            const line = pendingLines[i];
            const lineAmount = money(Number(line.base_amount) * (Number(line.commission_percentage) / 100));
            const isLast = i === pendingLines.length - 1;
            const amountToPay = isLast ? money(amount - allocatedSoFar) : lineAmount;
            allocatedSoFar = money(allocatedSoFar + amountToPay);

            await tx.payrollPayment.create({
              data: {
                salaryPaymentId: salaryPayment.id,
                payrollLineId: line.id,
                amount: amountToPay,
              },
            });
          }
        }

        const remainingDoctorLines = await tx.payrollLine.findMany({
          where: {
            payrollId,
            payrollPayments: { none: {} },
          },
          select: { id: true },
        });

        const remainingSalaryPayments = await tx.user.findMany({
          where: {
            active: true,
            role: {
              base_salary: { not: null },
            },
          },
          select: {
            id: true,
            salaryPayments: {
              where: { payrollId },
              select: { id: true },
            },
          },
        });

        const remainingSalaryUsers = remainingSalaryPayments.filter((user) => user.salaryPayments.length === 0);

        if (remainingDoctorLines.length === 0 && remainingSalaryUsers.length === 0 && payroll.status.trim().toUpperCase() !== 'PAID') {
          await tx.payroll.update({
            where: { id: payrollId },
            data: { status: 'Paid' },
          });
        }

        return tx.salaryPayment.findUnique({
          where: { id: salaryPayment.id },
          select: salaryPaymentSelect,
        });
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
      if (data.amount !== undefined || data.userId !== undefined || data.payrollId !== undefined) {
        throw new Error('No se permite modificar usuario, nómina o monto de un pago salarial ya creado');
      }

      const updated = await prisma.salaryPayment.update({
        where: { id },
        data: {
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
