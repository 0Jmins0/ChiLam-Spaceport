import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface InterviewCardProps {
  slug: string;
  title: string;
  source?: string;
  date: Date;
  mediaType: string; // VIDEO | AUDIO | TEXT
  className?: string;
}

const mediaTypeLabels: Record<string, string> = {
  VIDEO: '视频',
  AUDIO: '音频',
  TEXT: '图文',
};

function formatDate(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function InterviewCard({
  slug,
  title,
  source,
  date,
  mediaType,
  className,
}: InterviewCardProps) {
  const typeLabel = mediaTypeLabels[mediaType] || mediaType;

  return (
    <Link href={`/interviews/${slug}`} className={cn('block', className)}>
      <Card className="p-4">
        {/* Media type badge */}
        <div className="mb-3">
          <Tag active>{typeLabel}</Tag>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
          {title}
        </h3>

        {/* Source + Date */}
        <p className="mt-2 text-xs text-text-muted">
          {source && <span>{source} · </span>}
          {formatDate(date)}
        </p>
      </Card>
    </Link>
  );
}
