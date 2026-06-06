import { getTimelineEvents } from '@/lib/queries/timeline';
import { TimelineNode } from './TimelineNode';

export async function Timeline() {
  const events = await getTimelineEvents();

  // 按年份分组
  const groupedByYear = events.reduce(
    (acc, event) => {
      const year = new Date(event.date).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(event);
      return acc;
    },
    {} as Record<number, typeof events>,
  );

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="relative">
      {/* 中央金色竖线 */}
      <div className="absolute left-4 top-0 bottom-0 w-[0.5px] bg-accent/30 md:left-1/2 md:-translate-x-[0.25px]" />

      <div className="space-y-12">
        {years.map((year) => (
          <div key={year}>
            {/* 年份标题 */}
            <div className="relative mb-8 flex items-center">
              <div className="ml-4 md:absolute md:left-1/2 md:ml-0 md:-translate-x-1/2">
                <span className="font-display text-3xl italic text-accent/60">{year}</span>
              </div>
            </div>
            {/* 该年事件 */}
            <div className="space-y-8">
              {groupedByYear[year].map((event, index) => (
                <TimelineNode key={event.id} event={event} isLeft={index % 2 === 0} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
