import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface AlbumCardProps {
  slug: string;
  title: string;
  releaseYear: number;
  language?: string;
  coverUrl?: string;
  coverWidth?: number | null;
  coverHeight?: number | null;
  priority?: boolean;
  className?: string;
}

export function AlbumCard({
  slug,
  title,
  releaseYear,
  language,
  coverUrl,
  coverWidth,
  coverHeight,
  priority,
  className,
}: AlbumCardProps) {
  return (
    <Link
      href={`/archives/albums/${slug}`}
      className={cn('block break-inside-avoid mb-4', className)}
    >
      <Card className="p-0 overflow-hidden">
        {/* Cover */}
        <div
          className="relative w-full bg-bg-darker overflow-hidden"
          style={{
            aspectRatio: coverWidth && coverHeight ? `${coverWidth}/${coverHeight}` : '1/1',
          }}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl font-heading text-accent/40">♪</span>
            </div>
          )}

          {/* Language badge */}
          {language && (
            <div className="absolute left-3 top-3">
              <Tag active>{language}</Tag>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
            {title}
          </h3>
          <p className="mt-1 text-xs text-text-muted">{releaseYear}</p>
        </div>
      </Card>
    </Link>
  );
}
