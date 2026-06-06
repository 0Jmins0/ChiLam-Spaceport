import { Card } from '@/components/ui/Card';

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string | null;
  relatedType: string | null;
  relatedId: string | null;
}

interface TimelineNodeProps {
  event: TimelineEvent;
  isLeft: boolean;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function TimelineNode({ event, isLeft }: TimelineNodeProps) {
  return (
    <div className="relative flex items-start">
      {/* 金色圆点 - 移动端在左侧竖线上，桌面端在中间 */}
      <div className="absolute left-4 top-4 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-accent md:left-1/2 md:-translate-x-1/2" />

      {/* 移动端：所有卡片在右侧 */}
      {/* 桌面端：左右交替 */}
      <div
        className={`ml-10 w-full md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-10' : 'md:ml-auto md:pl-10'}`}
      >
        <Card hover={false} className="px-5 py-4">
          <p className="font-display text-xs italic tracking-widest text-accent/60">
            {formatDate(event.date)}
          </p>
          <h3 className="mt-1.5 font-heading text-base font-semibold text-text-primary">
            {event.title}
          </h3>
          {event.description && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{event.description}</p>
          )}
          {event.relatedType && event.relatedId && (
            <div className="mt-3 flex items-center gap-1 text-xs text-accent/50">
              <span>查看详情</span>
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
