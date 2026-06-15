import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivitiesFilterBar } from '@/components/activities/ActivitiesFilterBar';
import { EndorsementCard } from '@/components/activities/EndorsementCard';
import { LivestreamCard } from '@/components/activities/LivestreamCard';
import { MasonryLayout } from '@/components/ui/MasonryLayout';
import { Pagination } from '@/components/updates/Pagination';
import {
  getEndorsements,
  getLivestreams,
  getActivityCounts,
} from '@/lib/queries/activities';
import { CreateEntryTrigger } from '@/components/edit/CreateEntryTrigger';

export const metadata = { title: '活动' };
export const dynamic = 'force-dynamic';

function buildBaseUrl(tab: string, platform?: string): string {
  const params = new URLSearchParams();
  params.set('tab', tab);
  if (tab === 'livestream' && platform) params.set('platform', platform);
  return `/activities?${params.toString()}`;
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; platform?: string; page?: string }>;
}) {
  const params = await searchParams;
  const rawTab = params.tab || 'endorsement';
  const tab = rawTab === 'endorsement' || rawTab === 'livestream' ? rawTab : 'endorsement';
  const platform = params.platform;
  const page = Number(params.page) || 1;

  const [counts, data] = await Promise.all([
    getActivityCounts(),
    tab === 'livestream'
      ? getLivestreams({ platform, page })
      : getEndorsements({ page }),
  ]);

  const baseUrl = buildBaseUrl(tab, platform);

  return (
    <PageContainer>
      <PageHeader title="活动" titleEn="Activities" description="捕捉台前幕后的每一次亮相" />

      <div className="flex items-center justify-between gap-4 mb-8">
        <ActivitiesFilterBar
          currentTab={tab}
          currentPlatform={platform}
          counts={counts}
          className="flex-1"
        />
        <CreateEntryTrigger
          entityType={tab === 'livestream' ? 'livestream' : 'endorsement'}
          label={tab === 'livestream' ? '新增直播' : '新增代言'}
        />
      </div>

      {data.items.length > 0 ? (
        tab === 'endorsement' ? (
          <MasonryLayout>
            {data.items.map((item) => {
              const endorsement = item as Awaited<
                ReturnType<typeof getEndorsements>
              >['items'][number];
              return (
                <EndorsementCard
                  key={endorsement.id}
                  slug={endorsement.slug}
                  brand={endorsement.brand}
                  role={endorsement.role ?? undefined}
                  category={endorsement.category ?? undefined}
                  startYear={endorsement.startYear}
                  endYear={endorsement.endYear ?? undefined}
                  mediaUrl={endorsement.mediaUrls[0]?.url}
                />
              );
            })}
          </MasonryLayout>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((item) => {
              const livestream = item as Awaited<
                ReturnType<typeof getLivestreams>
              >['items'][number];
              return (
                <LivestreamCard
                  key={livestream.id}
                  slug={livestream.slug}
                  title={livestream.title}
                  platform={livestream.platform}
                  date={livestream.date}
                  duration={livestream.duration ?? undefined}
                  replayUrl={livestream.replayUrl ?? undefined}
                />
              );
            })}
          </div>
        )
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
