import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { InterviewsFilterBar } from '@/components/interviews/InterviewsFilterBar';
import { InterviewCard } from '@/components/interviews/InterviewCard';
import { Pagination } from '@/components/updates/Pagination';
import { getInterviews, getInterviewCounts } from '@/lib/queries/interviews';
import { CreateEntryTrigger } from '@/components/edit/CreateEntryTrigger';

export const metadata = { title: '霖言霖语' };
export const dynamic = 'force-dynamic';

function buildBaseUrl(mediaType?: string): string {
  const params = new URLSearchParams();
  if (mediaType) params.set('mediaType', mediaType);
  const qs = params.toString();
  return qs ? `/interviews?${qs}` : '/interviews';
}

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ mediaType?: string; page?: string }>;
}) {
  const params = await searchParams;
  const mediaType = params.mediaType;
  const page = Number(params.page) || 1;

  const [counts, data] = await Promise.all([
    getInterviewCounts(),
    getInterviews({ mediaType, page }),
  ]);

  const baseUrl = buildBaseUrl(mediaType);

  return (
    <PageContainer>
      <PageHeader title="霖言霖语" titleEn="Interviews" description="记录每一次对话与分享" />

      <div className="flex items-center justify-between gap-4 mb-8">
        <InterviewsFilterBar
          currentMediaType={mediaType || ''}
          totalCount={counts.total}
          counts={{ VIDEO: counts.video, AUDIO: counts.audio, TEXT: counts.text }}
          className="flex-1"
        />
        <CreateEntryTrigger entityType="interview" label="新增访谈" />
      </div>

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((interview) => (
            <InterviewCard
              key={interview.id}
              slug={interview.slug}
              title={interview.title}
              source={interview.source ?? undefined}
              date={interview.date}
              mediaType={interview.mediaType}
              coverImageUrl={interview.coverImageUrl ?? undefined}
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
