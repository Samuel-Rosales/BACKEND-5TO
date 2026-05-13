import { prisma } from '../seed/shared';

async function main() {
  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId: 1 },
    orderBy: { id: 'asc' },
  });

  const availabilities = await prisma.doctorAvailability.findMany({
    where: { doctorScheduleId: { in: schedules.map((s) => s.id) } },
    orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }],
  });

  console.log(JSON.stringify({ schedules, availabilities }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
