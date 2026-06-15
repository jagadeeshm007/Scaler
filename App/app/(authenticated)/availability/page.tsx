import { verifySession } from '@/lib/dal';
import { ScheduleList } from '@/components/availability/schedule-list';

export default async function AvailabilityPage() {
  await verifySession();
  return <ScheduleList />;
}
