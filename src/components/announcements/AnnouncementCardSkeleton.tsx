import { Card } from '@/components/ui/Card';

export function AnnouncementCardSkeleton() {
  return (
    <Card className="p-4 space-y-3" hover={false}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-12 animate-pulse rounded bg-bg-darker" />
        <div className="h-4 w-24 animate-pulse rounded bg-bg-darker" />
      </div>

      {/* Title skeleton */}
      <div className="h-5 w-3/4 animate-pulse rounded bg-bg-darker" />

      {/* Content skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-bg-darker" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-bg-darker" />
      </div>
    </Card>
  );
}
