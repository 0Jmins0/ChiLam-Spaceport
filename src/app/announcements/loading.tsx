import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnnouncementCardSkeleton } from '@/components/announcements/AnnouncementCardSkeleton';

export default function AnnouncementsLoading() {
  return (
    <PageContainer>
      <PageHeader title="公告" titleEn="Announcements" description="「停水停电不另行通知」板" />

      {/* Tab skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded bg-bg-darker" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <AnnouncementCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
