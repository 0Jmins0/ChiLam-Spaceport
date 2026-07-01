import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface NewsArticleCardProps {
  id: string;
  slug?: string;
  originalUrl: string;
  title: string;
  summary?: string;
  source?: string;
  thumbnailUrl?: string;
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
  thumbnailUrl,
  publishedAt,
  priority,
  className,
}: NewsArticleCardProps) {
  return (
    <Link href={originalUrl} className={cn('block break-inside-avoid mb-4', className)}>
      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full shrink-0 bg-bg-darker md:aspect-[16/9] md:w-[200px]">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 200px"
                priority={priority}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-2xl font-heading text-accent/40">NEWS</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between space-y-2 p-4">
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
                <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">
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
