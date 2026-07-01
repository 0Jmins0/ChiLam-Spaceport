import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { getMediaAspectRatio, type UpdateMediaPreview } from '@/lib/update-media';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface SightingCardProps {
  id: string;
  slug?: string;
  originalUrl?: string;
  title: string;
  summary?: string;
  previewMedia?: UpdateMediaPreview | null;
  sightedAt: string | Date;
  authorName?: string;
  tags?: string[];
  className?: string;
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function SightingCard({
  originalUrl,
  title,
  summary,
  previewMedia,
  sightedAt,
  authorName,
  tags,
  className,
}: SightingCardProps) {
  const hasPreview = Boolean(previewMedia?.url);
  const isVideo = previewMedia?.type === 'VIDEO';
  const sightingTypeTag = tags?.find(
    (tag) =>
      tag === '机场' || tag === '片场' || tag === '偶遇' || tag === 'airport' || tag === 'set',
  );

  const content = (
    <Card className="p-0 overflow-hidden">
      {/* Thumbnail */}
      <div
        className="relative w-full bg-bg-darker"
        style={{ aspectRatio: getMediaAspectRatio(previewMedia) }}
      >
        {hasPreview ? (
          <Image
            src={previewMedia!.url}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl font-heading text-accent/40">路透</span>
          </div>
        )}

        {/* Sighting type badge */}
        {sightingTypeTag && (
          <div className="absolute left-3 top-3">
            <Tag active>{sightingTypeTag}</Tag>
          </div>
        )}
        {isVideo && (
          <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm">
            <span className="ml-0.5 text-sm">▶</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
          {title}
        </h3>
        {summary && (
          <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">{summary}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {authorName && <span>{authorName}</span>}
          {authorName && <span>·</span>}
          <span>{formatDate(sightedAt)}</span>
        </div>
      </div>
    </Card>
  );

  if (originalUrl) {
    return (
      <Link href={originalUrl} className={cn('block', className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn('', className)}>{content}</div>;
}
