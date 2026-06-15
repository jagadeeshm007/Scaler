const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('No user');
  const schedule = await prisma.schedule.findFirst({ where: { user_id: user.id } });
  if (!schedule) return console.log('No schedule');
  const overrideDate = new Date('2026-12-25');
  await prisma.dateOverride.create({
    data: {
      schedule_id: schedule.id,
      date: overrideDate,
      start_time: '10:00',
      end_time: '14:00',
      is_available: true,
    },
  });
  console.log('Created override for 2026-12-25');
}
run();
