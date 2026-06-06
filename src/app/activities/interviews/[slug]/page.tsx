import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getInterviewBySlug } from '@/lib/queries/activities';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

const mediaTypeLabels: Record<string, string> = {
  VIDEO: '视频',
  AUDIO: '音频',
  TEXT: '图文',
  LIVE: '直播',
};

function formatDate(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

  const typeLabel = mediaTypeLabels[interview.mediaType] || interview.mediaType;
  const isProofread = interview.proofreadStatus === 'PROOFREAD';

  return (
    <PageContainer>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/activities?tab=interview"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回活动
        </Link>
      </div>

      {/* Header section */}
      <div className="space-y-4 max-w-3xl">
        {/* Media type badge */}
        <Tag active>{typeLabel}</Tag>

        {/* Title */}
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
          {interview.title}
        </h1>

        {/* Meta info */}
        <p className="text-sm text-text-muted">
          {[interview.source, formatDate(interview.date)].filter(Boolean).join(' · ')}
        </p>

        {/* Gold line */}
        <div className="gold-line" />

        {/* Summary */}
        {interview.summary && (
          <p className="text-text-secondary leading-relaxed">{interview.summary}</p>
        )}

        {/* Original URL button */}
        {interview.originalUrl && (
          <div>
            <a href={interview.originalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                查看原始内容 ↗
              </Button>
            </a>
          </div>
        )}

        {/* Tags */}
        {interview.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interview.tags.map((tag) => (
              <Tag key={tag.slug}>{tag.name}</Tag>
            ))}
          </div>
        )}
      </div>

      {/* Transcript section */}
      {(interview.transcriptCantonese || interview.transcriptMandarin) && (
        <div className="mt-8 max-w-3xl space-y-8">
          {/* Proofread status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isProofread ? (
              <span className="text-accent">AI 转录，已人工校对 ✓</span>
            ) : (
              <span className="text-text-muted">AI 转录，待校对</span>
            )}
          </div>

          {/* Cantonese transcript */}
          {interview.transcriptCantonese && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg text-text-primary">粤语原文</h2>
              <div className="rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 p-6">
                <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {interview.transcriptCantonese}
                </div>
              </div>
            </div>
          )}

          {/* Mandarin transcript */}
          {interview.transcriptMandarin && (
            <div className="space-y-3">
              <h2 className="font-heading text-lg text-text-primary">国语翻译</h2>
              <div className="rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 p-6">
                <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {interview.transcriptMandarin}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Related info placeholder */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">相关资讯</h2>
        <p className="text-sm text-text-muted">即将上线，敬请期待</p>
      </div>
    </PageContainer>
  );
}
