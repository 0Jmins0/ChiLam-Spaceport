import Image from 'next/image';
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
  coverImageUrl?: string;
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
  coverImageUrl,
  className,
}: LivestreamCardProps) {
  const platformLabel = platformLabels[platform] || platform;

  return (
    <Link href={`/activities/livestreams/${slug}`} className={cn('block', className)}>
      <Card className="p-0 overflow-hidden">
        {/* Cover image */}
        <div className="relative aspect-[16/9] w-full bg-bg-darker overflow-hidden">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                className="h-8 w-8 text-accent/30"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
          )}
          {/* Platform badge overlay */}
          <div className="absolute left-3 top-3">
            <Tag active>{platformLabel}</Tag>
          </div>
          {replayUrl && (
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-accent/80 px-2 py-0.5 text-[10px] font-medium text-white">
                可回放
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
            {title}
          </h3>
          <p className="mt-1.5 text-xs text-text-muted">
            {formatDate(date)}
            {duration != null && <span> · {duration}分钟</span>}
          </p>
        </div>
      </Card>
    </Link>
  );
}
