import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScreensFilterBar } from '@/components/screens/ScreensFilterBar';
import { ProductionCard } from '@/components/screens/ProductionCard';
import { MasonryLayout } from '@/components/ui/MasonryLayout';
import { Pagination } from '@/components/updates/Pagination';
import { getProductions, getProductionCounts } from '@/lib/queries/productions';
import { CreateEntryTrigger } from '@/components/edit/CreateEntryTrigger';

export const metadata = { title: '影视综' };
export const dynamic = 'force-dynamic';

const tabToType: Record<string, string> = {
  movie: 'MOVIE',
  tv_series: 'TV_SERIES',
  variety_show: 'VARIETY_SHOW',
};

function buildBaseUrl(tab: string, roleType?: string): string {
  const params = new URLSearchParams();
  params.set('tab', tab);
  if (roleType) params.set('roleType', roleType);
  return `/screens?${params.toString()}`;
}

export default async function ScreensPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; roleType?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'movie';
  const roleType = params.roleType;
  const page = Number(params.page) || 1;

  const type = tabToType[tab];

  const [counts, data] = await Promise.all([
    getProductionCounts(),
    getProductions({ type, roleType, page }),
  ]);

  const baseUrl = buildBaseUrl(tab, roleType);

  return (
    <PageContainer>
      <PageHeader title="影视综" titleEn="Screens" description="电影 · 电视剧 · 综艺" />

      <div className="flex items-center justify-between gap-4 mb-8">
        <ScreensFilterBar currentTab={tab} currentRoleType={roleType} counts={counts} className="flex-1" />
        <CreateEntryTrigger entityType="production" defaultValues={{ type: type || 'MOVIE' }} label="新增作品" />
      </div>

      {data.items.length > 0 ? (
        <MasonryLayout>
          {data.items.map((item, index) => (
            <ProductionCard
              key={item.id}
              slug={item.slug}
              title={item.title}
              year={item.year}
              role={item.role ?? undefined}
              posterUrl={item.posterUrl ?? undefined}
              posterWidth={item.posterWidth}
              posterHeight={item.posterHeight}
              type={item.type}
              priority={index < 4}
            />
          ))}
        </MasonryLayout>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-text-muted">暂无作品</p>
        </div>
      )}

      {data.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={data.totalPages} baseUrl={baseUrl} />
      )}
    </PageContainer>
  );
}
