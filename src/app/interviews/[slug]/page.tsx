import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getInterviewBySlug } from '@/lib/queries/interviews';
import InterviewSidebar from '@/components/interviews/InterviewDetail/InterviewSidebar';
import InterviewMediaPanel from '@/components/interviews/InterviewDetail/InterviewMediaPanel';
import InterviewContentArea from '@/components/interviews/InterviewDetail/InterviewContentArea';
import ShareButton from '@/components/interviews/InterviewDetail/ShareButton';

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
    (img: { id: string; url: string; alt?: string | null; type: string }) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? null,
      type: img.type,
    }),
  );

  return (
    <div className="max-w-[var(--width-page)] mx-auto px-4 md:px-8 pt-16 pb-8">
      {/* 移动端：媒体优先显示 */}
      <div className="lg:hidden mb-8">
        <InterviewMediaPanel
          interviewId={interview.id}
          mediaType={interview.mediaType}
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
              interviewId={interview.id}
              source={interview.source ?? null}
              host={interview.host ?? null}
              location={interview.location ?? null}
              date={interview.date}
              duration={interview.duration ?? null}
              coverImageUrl={interview.coverImageUrl ?? null}
            />
          </div>
        </div>

        {/* 中栏 + 右栏 - 由 InterviewContentArea 管理联动 */}
        <InterviewContentArea
          interviewId={interview.id}
          title={interview.title}
          date={interview.date}
          proofreadStatus={interview.proofreadStatus}
          transcriptCantonese={interview.transcriptCantonese}
          transcriptMandarin={interview.transcriptMandarin}
          mediaType={interview.mediaType}
          embedUrl={interview.embedUrl ?? null}
          originalMediaUrl={interview.originalMediaUrl ?? null}
          galleryImages={galleryImages}
          summary={interview.summary ?? null}
          duration={interview.duration ?? null}
        />
      </div>

      {/* Share */}
      <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
        <ShareButton />
      </div>
    </div>
  );
}
