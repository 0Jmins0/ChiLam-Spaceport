import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnnouncementsFilterBar } from '@/components/announcements/AnnouncementsFilterBar';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { Pagination } from '@/components/updates/Pagination';
import { getAnnouncements, getAnnouncementCounts } from '@/lib/queries/announcements';
import type { AnnouncementTab } from '@/lib/types';

export const metadata = { title: '公告' };
export const dynamic = 'force-dynamic';

function buildBaseUrl(type?: string): string {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  return `/announcements?${params.toString()}`;
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const type = (params.type as AnnouncementTab) || undefined;
  const page = Number(params.page) || 1;

  const [counts, data] = await Promise.all([
    getAnnouncementCounts(),
    getAnnouncements({ type, page }),
  ]);

  const baseUrl = buildBaseUrl(type);

  return (
    <PageContainer>
      <PageHeader
        title="公告"
        titleEn="Announcements"
        description="「停水停电不另行通知」板"
      />

      <AnnouncementsFilterBar currentTab={type || 'notice'} counts={counts} />

      {data.items.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.items.map((item) => (
            <AnnouncementCard
              key={item.id}
              id={item.id}
              type={item.type}
              title={item.title}
              content={item.content}
              isPinned={item.isPinned}
              publishDate={item.publishDate}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-text-muted">暂无内容</p>
        </div>
      )}

      {data.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={data.totalPages} baseUrl={baseUrl} />
      )}
    </PageContainer>
  );
}
