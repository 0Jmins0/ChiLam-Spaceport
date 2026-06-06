import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';

interface ProductionCardSkeletonProps {
  className?: string;
}

export function ProductionCardSkeleton({ className }: ProductionCardSkeletonProps) {
  return (
    <Card hover={false} className={cn('p-0 overflow-hidden', className)}>
      {/* 海报骨架 */}
      <div className="aspect-[2/3] w-full animate-pulse bg-bg-darker" />

      {/* 底部信息骨架 */}
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-bg-darker" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-bg-darker" />
      </div>
    </Card>
  );
}
