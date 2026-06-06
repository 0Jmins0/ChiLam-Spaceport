import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArchiveCardSkeleton } from '@/components/archives/ArchiveCardSkeleton';

export default function ArchivesLoading() {
  return (
    <PageContainer>
      <PageHeader title="资料库" titleEn="Archives" description="专辑 · 杂志" />

      {/* Tab skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded bg-bg-darker" />
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-bg-darker" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ArchiveCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
