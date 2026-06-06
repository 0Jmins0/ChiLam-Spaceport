import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductionCardSkeleton } from '@/components/screens/ProductionCardSkeleton';

export default function ScreensLoading() {
  return (
    <PageContainer>
      <PageHeader title="影视综" titleEn="Screens" description="电影 · 电视剧 · 综艺" />

      {/* Tab 骨架 */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded bg-bg-darker" />
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-bg-darker" />
          ))}
        </div>
      </div>

      {/* Grid 骨架 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductionCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
