import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpdateCardSkeleton } from '@/components/updates/UpdateCardSkeleton';
import { MasonryGrid } from '@/components/updates/MasonryGrid';

export default function UpdatesLoading() {
  return (
    <PageContainer>
      <PageHeader title="动态" titleEn="Updates" description="关注他的每一个日常" />
      {/* Tab bar skeleton */}
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-bg-darker" />
      <MasonryGrid>
        {Array.from({ length: 8 }).map((_, i) => (
          <UpdateCardSkeleton key={i} variant="vertical" />
        ))}
      </MasonryGrid>
    </PageContainer>
  );
}
