import { SlotCalculator } from './src/utils/slot-calculator';
import { prisma } from './src/lib/prisma';

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('No user');
  const eventType = await prisma.eventType.findFirst({ where: { user_id: user.id } });
  if (!eventType) return console.log('No event type');

  const schedule = await prisma.schedule.findFirst({ where: { user_id: user.id } });
  if (!schedule) return console.log('No schedule');

  // Create override
  const overrideDateStr = '2026-12-25';
  await prisma.dateOverride.create({
    data: {
      schedule_id: schedule.id,
      date: new Date(overrideDateStr),
      start_time: '10:00',
      end_time: '14:00',
      is_available: true,
    },
  });
  console.log('Created override');

  const slots = await SlotCalculator.getAvailableSlots(
    eventType.id,
    overrideDateStr,
    schedule.timezone,
  );
  console.log('Slots:', slots.length > 0 ? slots : 'No slots found!');
}

run().catch(console.error);
