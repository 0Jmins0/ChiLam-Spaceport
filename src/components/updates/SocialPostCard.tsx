import Image from 'next/image';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface SocialPostCardProps {
  id: string;
  platform: string;
  originalUrl: string;
  title?: string;
  summary?: string;
  thumbnailUrl?: string;
  publishedAt: string | Date;
  tags?: string[];
  priority?: boolean;
  className?: string;
}

const platformLabels: Record<string, string> = {
  weibo: '微博',
  xiaohongshu: '小红书',
  douyin: '抖音',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

const platformIcons: Record<string, string> = {
  weibo: '微',
  xiaohongshu: '红',
  douyin: '抖',
  instagram: 'IG',
  facebook: 'FB',
};

function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function SocialPostCard({
  platform,
  originalUrl,
  title,
  summary,
  thumbnailUrl,
  publishedAt,
  priority,
  className,
}: SocialPostCardProps) {
  return (
    <a
      href={originalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('block', className)}
    >
      <Card className="p-0 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-[4/5] w-full bg-bg-darker">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title || '社交媒体帖子'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-3xl font-heading text-accent/40">
                {platformIcons[platform] || platform.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          {/* Platform badge */}
          <div className="absolute left-3 top-3">
            <Tag active>{platformLabels[platform] || platform}</Tag>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 p-4">
          {title && (
            <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
              {title}
            </h3>
          )}
          {summary && (
            <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">{summary}</p>
          )}
          <p className="text-xs text-text-muted">{formatDate(publishedAt)}</p>
        </div>
      </Card>
    </a>
  );
}
