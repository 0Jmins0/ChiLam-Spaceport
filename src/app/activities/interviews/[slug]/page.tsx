import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getInterviewBySlug } from '@/lib/queries/activities';
import InterviewSidebar from '@/components/activities/InterviewDetail/InterviewSidebar';
import InterviewTranscript from '@/components/activities/InterviewDetail/InterviewTranscript';
import InterviewMediaPanel from '@/components/activities/InterviewDetail/InterviewMediaPanel';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const interview = await getInterviewBySlug(slug);

  if (!interview) {
    return { title: '未找到' };
  }

  return {
    title: interview.title,
    description: interview.summary || `${interview.title} - 访谈`,
  };
}

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const interview = await getInterviewBySlug(slug);

  if (!interview) notFound();

  const galleryImages = (interview.galleryImages ?? []).map(
    (img: { url: string; alt?: string | null }) => ({
      url: img.url,
      alt: img.alt ?? null,
    }),
  );

  return (
    <div className="max-w-[var(--width-page)] mx-auto px-4 md:px-8 py-8">
      {/* 移动端：媒体优先显示 */}
      <div className="lg:hidden mb-8">
        <InterviewMediaPanel
          mediaType={interview.mediaType}
          proofreadStatus={interview.proofreadStatus}
          embedUrl={interview.embedUrl ?? null}
          originalMediaUrl={interview.originalMediaUrl ?? null}
          galleryImages={galleryImages}
          summary={interview.summary ?? null}
          duration={interview.duration ?? null}
        />
      </div>

      {/* 三栏布局 */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 左栏 - Sidebar */}
        <div className="lg:w-[220px] shrink-0">
          <div className="lg:sticky lg:top-24">
            <InterviewSidebar
              source={interview.source ?? null}
              host={interview.host ?? null}
              location={interview.location ?? null}
              date={interview.date}
              duration={interview.duration ?? null}
            />
          </div>
        </div>

        {/* 中栏 - Transcript */}
        <div className="flex-1 min-w-0">
          <InterviewTranscript
            title={interview.title}
            date={interview.date}
            proofreadStatus={interview.proofreadStatus}
            transcriptCantonese={interview.transcriptCantonese}
            transcriptMandarin={interview.transcriptMandarin}
          />
        </div>

        {/* 右栏 - MediaPanel（仅桌面端，移动端已在顶部显示） */}
        <div className="hidden lg:block lg:w-[350px] shrink-0">
          <div className="lg:sticky lg:top-24">
            <InterviewMediaPanel
              mediaType={interview.mediaType}
              proofreadStatus={interview.proofreadStatus}
              embedUrl={interview.embedUrl ?? null}
              originalMediaUrl={interview.originalMediaUrl ?? null}
              galleryImages={galleryImages}
              summary={interview.summary ?? null}
              duration={interview.duration ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
