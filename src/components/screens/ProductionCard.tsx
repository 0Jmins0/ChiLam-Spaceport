import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface ProductionCardProps {
  slug: string;
  title: string;
  year: number;
  role?: string;
  posterUrl?: string;
  type: string; // 'MOVIE' | 'TV_SERIES' | 'VARIETY_SHOW'
  className?: string;
}

const typeLabels: Record<string, string> = {
  MOVIE: '电影',
  TV_SERIES: '电视剧',
  VARIETY_SHOW: '综艺',
};

export function ProductionCard({
  slug,
  title,
  year,
  role,
  posterUrl,
  type,
  className,
}: ProductionCardProps) {
  const typeLabel = typeLabels[type] || type;

  return (
    <Link href={`/screens/${slug}`} className={cn('block', className)}>
      <Card className="p-0 overflow-hidden">
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full bg-bg-darker">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl font-heading text-accent/40">{typeLabel}</span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute left-3 top-3">
            <Tag active>{typeLabel}</Tag>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
            {title}
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            {year}
            {role && <span> · {role}</span>}
          </p>
        </div>
      </Card>
    </Link>
  );
}
