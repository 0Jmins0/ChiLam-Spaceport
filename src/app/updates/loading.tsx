import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpdateCardSkeleton } from '@/components/updates/UpdateCardSkeleton';
import { MasonryGrid } from '@/components/updates/MasonryGrid';

export default function UpdatesLoading() {
  return (
    <PageContainer>
      <PageHeader title="动态" titleEn="Updates" description="社交媒体 · 新闻报道 · 路透" />
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
