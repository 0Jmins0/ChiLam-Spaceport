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
  coverImageUrl?: string;
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
  coverImageUrl,
  className,
}: InterviewCardProps) {
  const typeLabel = mediaTypeLabels[mediaType] || mediaType;
  const hasBackground = !!coverImageUrl;

  return (
    <Link href={`/interviews/${slug}`} className={cn('block', className)}>
      <Card
        className={cn(
          'flex flex-col gap-3 p-4 h-full',
          hasBackground && 'relative overflow-hidden',
        )}
      >
        {/* 融合模式背景图 — 参考留言板 GuestbookCard */}
        {hasBackground && (
          <div
            className="absolute inset-y-0 right-0 w-[45%] pointer-events-none"
            style={{
              backgroundImage: `url(${coverImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.8) 70%, black 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.8) 70%, black 100%)',
            }}
          />
        )}

        {/* 内容区 */}
        <div className={cn(hasBackground && 'w-[55%] relative z-10', 'flex flex-col gap-3')}>
          {/* Media type badge */}
          <div>
            <Tag active>{typeLabel}</Tag>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
            {title}
          </h3>

          {/* Source + Date */}
          <p className="text-xs text-text-muted">
            {source && <span>{source} · </span>}
            {formatDate(date)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
