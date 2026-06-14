import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { PerformancesFilterBar } from '@/components/performances/PerformancesFilterBar';
import { PerformanceCard } from '@/components/performances/PerformanceCard';
import { MasonryLayout } from '@/components/ui/MasonryLayout';
import { Pagination } from '@/components/updates/Pagination';
import { getPerformances, getPerformanceCounts } from '@/lib/queries/performances';
import { CreateEntryTrigger } from '@/components/edit/CreateEntryTrigger';

export const metadata = { title: '演出' };
export const dynamic = 'force-dynamic';

const tabToType: Record<string, string> = {
  concert: 'CONCERT',
  stage: 'STAGE',
  musical: 'MUSICAL',
};

function buildBaseUrl(tab: string, series?: string): string {
  const params = new URLSearchParams();
  params.set('tab', tab);
  if (series) params.set('series', series);
  return `/performances?${params.toString()}`;
}

export default async function PerformancesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; series?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'concert';
  const series = params.series;
  const page = Number(params.page) || 1;

  const type = tabToType[tab];

  const [counts, data] = await Promise.all([
    getPerformanceCounts(),
    getPerformances({ type, series, page }),
  ]);

  const baseUrl = buildBaseUrl(tab, series);

  return (
    <PageContainer>
      <PageHeader title="演出" titleEn="Performances" description="演唱会 · 舞台 · 音乐剧" />

      <div className="flex items-center justify-between gap-4 mb-8">
        <PerformancesFilterBar
          currentTab={tab}
          currentSeries={series}
          counts={counts}
          className="flex-1"
        />
        <CreateEntryTrigger entityType="performance" defaultValues={{ type: type || 'CONCERT' }} label="新增演出" />
      </div>

      {data.items.length > 0 ? (
        <MasonryLayout>
          {data.items.map((item, index) => (
            <PerformanceCard
              key={item.id}
              slug={item.slug}
              title={item.title}
              year={item.year}
              venue={item.venue ?? undefined}
              city={item.city ?? undefined}
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
          <p className="text-text-muted">暂无演出</p>
        </div>
      )}

      {data.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={data.totalPages} baseUrl={baseUrl} />
      )}
    </PageContainer>
  );
}
