import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { GuestbookFilterBar } from '@/components/guestbook/GuestbookFilterBar';
import { GuestbookCard } from '@/components/guestbook/GuestbookCard';
import { GuestbookForm } from '@/components/guestbook/GuestbookForm';
import { Pagination } from '@/components/updates/Pagination';
import { getGuestbookEntries, getGuestbookCounts } from '@/lib/queries/guestbook';
import type { MessageTab } from '@/lib/types';

export const metadata = { title: '留言板' };
export const dynamic = 'force-dynamic';

function buildBaseUrl(tab: string): string {
  const params = new URLSearchParams();
  params.set('tab', tab);
  return `/messages?${params.toString()}`;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = (params.tab as MessageTab) || 'message';
  const page = Number(params.page) || 1;

  const [counts, data] = await Promise.all([
    getGuestbookCounts(),
    getGuestbookEntries({ tab, page }),
  ]);

  const baseUrl = buildBaseUrl(tab);

  return (
    <PageContainer>
      <PageHeader
        title="留言板"
        titleEn="Guestbook"
        description="我想对你说 · 故事分享 · 建议反馈"
      />

      <GuestbookFilterBar currentTab={tab} counts={counts} className="mb-8" />

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((item) => (
            <GuestbookCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-text-muted">暂无留言，来留下第一条吧</p>
        </div>
      )}

      {data.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={data.totalPages} baseUrl={baseUrl} />
      )}

      {/* 留言表单 */}
      <div className="mt-8">
        <GuestbookForm />
      </div>
    </PageContainer>
  );
}
