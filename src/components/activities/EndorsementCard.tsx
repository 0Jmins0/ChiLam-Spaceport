import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

interface EndorsementCardProps {
  slug: string;
  brand: string;
  role?: string;
  category?: string;
  startYear: number;
  endYear?: number;
  coverImageUrl?: string;
  mediaUrl?: string;
  className?: string;
}

export function EndorsementCard({
  slug,
  brand,
  role,
  category,
  startYear,
  endYear,
  coverImageUrl,
  mediaUrl,
  className,
}: EndorsementCardProps) {
  const yearRange = endYear ? `${startYear}-${endYear}` : `${startYear}-至今`;

  return (
    <Link href={`/activities/endorsements/${slug}`} className={cn('block', className)}>
      <Card className="p-0 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full bg-bg-darker overflow-hidden">
          {coverImageUrl || mediaUrl ? (
            <Image
              src={coverImageUrl || mediaUrl!}
              alt={brand}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl font-heading text-accent/40">{brand}</span>
            </div>
          )}

          {/* Category badge */}
          {category && (
            <div className="absolute left-3 top-3">
              <Tag active>{category}</Tag>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 font-heading text-sm leading-snug text-text-primary">
            {brand}
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            {role && <span>{role} · </span>}
            {yearRange}
          </p>
        </div>
      </Card>
    </Link>
  );
}
