import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { getMediaAspectRatio, type UpdateMediaPreview } from '@/lib/update-media';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface NewsArticleCardProps {
  id: string;
  slug?: string;
  originalUrl: string;
  title: string;
  summary?: string;
  source?: string;
  previewMedia?: UpdateMediaPreview | null;
  publishedAt: string | Date;
  tags?: string[];
  priority?: boolean;
  className?: string;
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function NewsArticleCard({
  originalUrl,
  title,
  summary,
  source,
  previewMedia,
  publishedAt,
  priority,
  className,
}: NewsArticleCardProps) {
  const hasPreview = Boolean(previewMedia?.url);
  const isVideo = previewMedia?.type === 'VIDEO';

  return (
    <Link href={originalUrl} className={cn('block break-inside-avoid mb-4', className)}>
      <Card className="p-0 overflow-hidden">
        <div className={cn('flex flex-col', hasPreview && 'md:flex-row')}>
          {/* Thumbnail */}
          {hasPreview && (
            <div
              className="relative w-full shrink-0 bg-bg-darker md:w-[220px]"
              style={{ aspectRatio: getMediaAspectRatio(previewMedia) }}
            >
              <Image
                src={previewMedia!.url}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 220px"
                priority={priority}
              />
              {isVideo && (
                <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm">
                  <span className="ml-0.5 text-sm">▶</span>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className={cn(
              'flex flex-1 flex-col justify-between space-y-3 p-4',
              !hasPreview && 'p-5 md:p-6',
            )}
          >
            <div className="space-y-2">
              {source && (
                <div>
                  <Tag>{source}</Tag>
                </div>
              )}
              <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
                {title}
              </h3>
              {summary && (
                <p
                  className={cn(
                    'text-xs leading-relaxed text-text-secondary',
                    hasPreview ? 'line-clamp-3' : 'line-clamp-5',
                  )}
                >
                  {summary}
                </p>
              )}
            </div>
            <p className="text-xs text-text-muted">{formatDate(publishedAt)}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
