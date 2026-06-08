import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivitiesFilterBar } from '@/components/activities/ActivitiesFilterBar';
import { EndorsementCard } from '@/components/activities/EndorsementCard';
import { InterviewCard } from '@/components/activities/InterviewCard';
import { LivestreamCard } from '@/components/activities/LivestreamCard';
import { Pagination } from '@/components/updates/Pagination';
import {
  getEndorsements,
  getInterviews,
  getLivestreams,
  getActivityCounts,
} from '@/lib/queries/activities';

export const metadata = { title: '活动' };
export const dynamic = 'force-dynamic';

function buildBaseUrl(tab: string, mediaType?: string, platform?: string): string {
  const params = new URLSearchParams();
  params.set('tab', tab);
  if (tab === 'interview' && mediaType) params.set('mediaType', mediaType);
  if (tab === 'livestream' && platform) params.set('platform', platform);
  return `/activities?${params.toString()}`;
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; mediaType?: string; platform?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'endorsement';
  const mediaType = params.mediaType;
  const platform = params.platform;
  const page = Number(params.page) || 1;

  const [counts, data] = await Promise.all([
    getActivityCounts(),
    tab === 'interview'
      ? getInterviews({ mediaType, page })
      : tab === 'livestream'
        ? getLivestreams({ platform, page })
        : getEndorsements({ page }),
  ]);

  const baseUrl = buildBaseUrl(tab, mediaType, platform);

  return (
    <PageContainer>
      <PageHeader title="活动" titleEn="Activities" description="广告代言 · 访谈 · 直播" />

      <ActivitiesFilterBar
        currentTab={tab}
        currentMediaType={mediaType}
        currentPlatform={platform}
        counts={counts}
        className="mb-8"
      />

      {data.items.length > 0 ? (
        tab === 'endorsement' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          </div>
        ) : tab === 'livestream' ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((item) => {
              const interview = item as Awaited<ReturnType<typeof getInterviews>>['items'][number];
              return (
                <InterviewCard
                  key={interview.id}
                  slug={interview.slug}
                  title={interview.title}
                  source={interview.source ?? undefined}
                  date={interview.date}
                  mediaType={interview.mediaType}
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
