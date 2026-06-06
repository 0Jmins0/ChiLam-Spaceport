import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';

interface ActivityCardSkeletonProps {
  className?: string;
}

export function ActivityCardSkeleton({ className }: ActivityCardSkeletonProps) {
  return (
    <Card hover={false} className={cn('p-0 overflow-hidden', className)}>
      {/* Image skeleton */}
      <div className="aspect-[4/3] w-full animate-pulse bg-bg-darker" />

      {/* Info skeleton */}
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-bg-darker" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-bg-darker" />
      </div>
    </Card>
  );
}
