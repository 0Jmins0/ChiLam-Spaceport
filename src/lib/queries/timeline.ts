import { prisma } from '@/lib/db';

export async function getTimelineEvents(limit = 20) {
  const events = await prisma.timelineEvent.findMany({
    where: { isVisible: true },
    orderBy: [{ date: 'desc' }, { sortOrder: 'asc' }],
    take: limit,
  });
  return events;
}
