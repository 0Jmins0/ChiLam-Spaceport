import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getLivestreamBySlug } from '@/lib/queries/activities';
import { EditableText } from '@/components/edit/EditableText';
import { EditableImage } from '@/components/edit/EditableImage';
import { EditableMediaGallery } from '@/components/edit/EditableMediaGallery';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

const platformLabels: Record<string, string> = {
  weibo: '微博',
  douyin: '抖音',
  instagram: 'Instagram',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const livestream = await getLivestreamBySlug(slug);

  if (!livestream) {
    return { title: '未找到' };
  }

  return {
    title: livestream.title,
    description: livestream.summary || `${livestream.title} - 直播`,
  };
}

export default async function LivestreamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const livestream = await getLivestreamBySlug(slug);

  if (!livestream) notFound();

  const platformLabel = platformLabels[livestream.platform] || livestream.platform;

  return (
    <PageContainer>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/activities?tab=livestream"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回活动
        </Link>
      </div>

      {/* Cover + Header */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: cover */}
        <div className="w-full md:w-[480px] shrink-0">
          <EditableImage
            src={livestream.coverImageUrl}
            entityType="livestream"
            entityId={livestream.id}
            field="coverImageId"
            alt={livestream.title}
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)]">
              {livestream.coverImageUrl ? (
                <Image
                  src={livestream.coverImageUrl}
                  alt={livestream.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              ) : (
                <div className="absolute inset-0 bg-bg-darker flex items-center justify-center">
                  <svg
                    className="h-10 w-10 text-accent/30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </EditableImage>
        </div>

        {/* Right: info */}
        <div className="flex-1 space-y-4">
          {/* Platform badge */}
          <EditableText
            value={livestream.platform}
            entityType="livestream"
            entityId={livestream.id}
            field="platform"
            placeholder="平台..."
            className="text-sm"
          >
            <Tag active>{platformLabel}</Tag>
          </EditableText>

          {/* Title */}
          <EditableText
            value={livestream.title}
            entityType="livestream"
            entityId={livestream.id}
            field="title"
            className="font-heading text-2xl md:text-3xl font-semibold text-text-primary"
          >
            <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
              {livestream.title}
            </h1>
          </EditableText>

          {/* Meta info */}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>{formatDate(livestream.date)}</span>
            <EditableText
              value={livestream.duration != null ? String(livestream.duration) : ''}
              entityType="livestream"
              entityId={livestream.id}
              field="duration"
              placeholder="时长(分钟)..."
              className="text-sm text-text-muted"
            >
              {livestream.duration != null ? <span>· {livestream.duration}分钟</span> : null}
            </EditableText>
          </div>

          {/* Gold line */}
          <div className="gold-line" />

          {/* Summary */}
          <EditableText
            value={livestream.summary}
            entityType="livestream"
            entityId={livestream.id}
            field="summary"
            multiline
            placeholder="添加简介..."
            className="text-text-secondary leading-relaxed"
          >
            {livestream.summary ? (
              <p className="text-text-secondary leading-relaxed">{livestream.summary}</p>
            ) : null}
          </EditableText>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <EditableText
              value={livestream.originalUrl ?? ''}
              entityType="livestream"
              entityId={livestream.id}
              field="originalUrl"
              placeholder="原始链接..."
              className="text-sm"
            >
              {livestream.originalUrl ? (
                <a href={livestream.originalUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    查看直播原链接 ↗
                  </Button>
                </a>
              ) : null}
            </EditableText>
            <EditableText
              value={livestream.replayUrl ?? ''}
              entityType="livestream"
              entityId={livestream.id}
              field="replayUrl"
              placeholder="回放链接..."
              className="text-sm"
            >
              {livestream.replayUrl ? (
                <a href={livestream.replayUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    观看回放 ↗
                  </Button>
                </a>
              ) : null}
            </EditableText>
          </div>

          {/* Tags */}
          {livestream.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {livestream.tags.map((tag) => (
                <Tag key={tag.slug}>{tag.name}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media gallery */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">相关媒体</h2>
        <EditableMediaGallery
          media={livestream.media}
          entityType="livestream"
          entityId={livestream.id}
          relation="media"
        />
      </div>

      {/* Related info placeholder */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">相关资讯</h2>
        <p className="text-sm text-text-muted">即将上线，敬请期待</p>
      </div>
    </PageContainer>
  );
}
