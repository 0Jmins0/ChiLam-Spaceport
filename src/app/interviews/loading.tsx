import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function InterviewsLoading() {
  return (
    <PageContainer>
      <PageHeader title="霖言霖语" titleEn="Interviews" description="记录每一次对话与分享" />

      {/* Filter skeleton */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-bg-darker" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} hover={false} className="p-4 space-y-3">
            <div className="h-5 w-12 animate-pulse rounded bg-bg-darker" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-bg-darker" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-bg-darker" />
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
