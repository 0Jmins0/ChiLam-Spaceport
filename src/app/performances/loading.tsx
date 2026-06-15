import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { PerformanceCardSkeleton } from '@/components/performances/PerformanceCardSkeleton';

export default function PerformancesLoading() {
  return (
    <PageContainer>
      <PageHeader title="演出" titleEn="Performances" description="凝望聚光灯下，永远闪耀的他" />

      {/* Filter bar skeleton */}
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded bg-bg-darker" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <PerformanceCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
