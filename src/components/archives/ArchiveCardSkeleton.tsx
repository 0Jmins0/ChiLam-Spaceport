import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';

interface ArchiveCardSkeletonProps {
  /** 'album' uses aspect-[1/1], 'magazine' uses aspect-[2/3] */
  variant?: 'album' | 'magazine';
  className?: string;
}

export function ArchiveCardSkeleton({ variant = 'album', className }: ArchiveCardSkeletonProps) {
  return (
    <Card hover={false} className={cn('p-0 overflow-hidden', className)}>
      {/* Cover skeleton */}
      <div
        className={cn(
          'w-full animate-pulse bg-bg-darker',
          variant === 'album' ? 'aspect-[1/1]' : 'aspect-[2/3]',
        )}
      />

      {/* Info skeleton */}
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-bg-darker" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-bg-darker" />
      </div>
    </Card>
  );
}
