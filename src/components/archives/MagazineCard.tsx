import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';

interface MagazineCardProps {
  slug: string;
  title: string;
  issue?: string;
  date: Date;
  coverUrl?: string;
  coverWidth?: number | null;
  coverHeight?: number | null;
  priority?: boolean;
  className?: string;
}

function formatMonth(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function MagazineCard({
  slug,
  title,
  issue,
  date,
  coverUrl,
  coverWidth,
  coverHeight,
  priority,
  className,
}: MagazineCardProps) {
  return (
    <Link
      href={`/archives/magazines/${slug}`}
      className={cn('block break-inside-avoid mb-4', className)}
    >
      <Card className="p-0 overflow-hidden">
        {/* Cover */}
        <div
          className="relative w-full bg-bg-darker overflow-hidden"
          style={{
            aspectRatio: coverWidth && coverHeight ? `${coverWidth}/${coverHeight}` : '2/3',
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
            <div className="flex h-full items-center justify-center px-4">
              <span className="text-center text-lg font-heading text-accent/40 line-clamp-3">
                {title}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
            {title}
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            {issue && <span>{issue} · </span>}
            {formatMonth(date)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
