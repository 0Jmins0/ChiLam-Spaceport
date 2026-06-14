import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { GuestbookCardSkeleton } from '@/components/guestbook/GuestbookCardSkeleton';

export default function MessagesLoading() {
  return (
    <PageContainer>
      <PageHeader
        title="留言板"
        titleEn="Guestbook"
        description="我想对你说 · 故事分享 · 建议反馈"
      />

      {/* Tab skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-9 w-28 rounded-full bg-bg-darker animate-pulse" />
        <div className="h-9 w-24 rounded-full bg-bg-darker animate-pulse" />
        <div className="h-9 w-24 rounded-full bg-bg-darker animate-pulse" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <GuestbookCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
