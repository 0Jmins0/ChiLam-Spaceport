import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivityCardSkeleton } from '@/components/activities/ActivityCardSkeleton';

export default function ActivitiesLoading() {
  return (
    <PageContainer>
      <PageHeader title="活动" titleEn="Activities" description="广告代言 · 访谈" />

      {/* Tab skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded bg-bg-darker" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ActivityCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
