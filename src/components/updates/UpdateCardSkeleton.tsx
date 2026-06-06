import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';

interface UpdateCardSkeletonProps {
  variant?: 'vertical' | 'horizontal';
  className?: string;
}

export function UpdateCardSkeleton({ variant = 'vertical', className }: UpdateCardSkeletonProps) {
  if (variant === 'horizontal') {
    return (
      <div className={cn('break-inside-avoid mb-4', className)}>
        <Card hover={false} className="p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Thumbnail skeleton */}
            <div className="aspect-video w-full shrink-0 animate-pulse bg-bg-darker md:w-[200px]" />

            {/* Content skeleton */}
            <div className="flex flex-1 flex-col space-y-3 p-4">
              <div className="h-4 w-16 animate-pulse rounded bg-bg-darker" />
              <div className="h-4 w-full animate-pulse rounded bg-bg-darker" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-bg-darker" />
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-bg-darker" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-bg-darker" />
              </div>
              <div className="h-3 w-20 animate-pulse rounded bg-bg-darker" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('break-inside-avoid mb-4', className)}>
      <Card hover={false} className="p-0 overflow-hidden">
        {/* Thumbnail skeleton */}
        <div className="aspect-[4/5] w-full animate-pulse bg-bg-darker" />

        {/* Content skeleton */}
        <div className="space-y-2 p-4">
          <div className="h-4 w-full animate-pulse rounded bg-bg-darker" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-bg-darker" />
          <div className="space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-bg-darker" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-bg-darker" />
          </div>
          <div className="h-3 w-20 animate-pulse rounded bg-bg-darker" />
        </div>
      </Card>
    </div>
  );
}
