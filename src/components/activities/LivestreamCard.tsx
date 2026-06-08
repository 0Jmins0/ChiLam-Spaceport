import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface LivestreamCardProps {
  slug: string;
  title: string;
  platform: string;
  date: string;
  duration?: number;
  replayUrl?: string;
  className?: string;
}

const platformLabels: Record<string, string> = {
  weibo: '微博',
  douyin: '抖音',
  instagram: 'Instagram',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function LivestreamCard({
  slug,
  title,
  platform,
  date,
  duration,
  replayUrl,
  className,
}: LivestreamCardProps) {
  const platformLabel = platformLabels[platform] || platform;

  return (
    <Link href={`/activities/livestreams/${slug}`} className={cn('block', className)}>
      <Card className="p-4">
        {/* Platform badge */}
        <div className="mb-3 flex items-center gap-2">
          <Tag active>{platformLabel}</Tag>
          {replayUrl && (
            <span className="text-xs text-accent">可回放</span>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
          {title}
        </h3>

        {/* Date + Duration */}
        <p className="mt-2 text-xs text-text-muted">
          {formatDate(date)}
          {duration != null && <span> · {duration}分钟</span>}
        </p>
      </Card>
    </Link>
  );
}
