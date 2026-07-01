import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSightingBySlug } from '@/lib/queries/updates';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import MarkdownContent from '@/components/ui/MarkdownContent';
import { EditableText } from '@/components/edit/EditableText';
import { EditableMediaGallery } from '@/components/edit/EditableMediaGallery';
import { UpdateItemVisibilityToggle } from '@/components/updates/UpdateItemVisibilityToggle';
import { RelatedContentList } from '@/components/relations/RelatedContentList';
import { ContentRelationEditor } from '@/components/relations/ContentRelationEditor';
import { getOutgoingRelatedContent } from '@/lib/content-relations';

// Next.js 16: params 是 Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sighting = await getSightingBySlug(slug);
  if (!sighting) return { title: '未找到' };
  return {
    title: sighting.title,
    description: sighting.summary || undefined,
  };
}

export default async function SightingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sighting = await getSightingBySlug(slug);
  if (!sighting) notFound();
  const relatedContent = await getOutgoingRelatedContent('sighting', sighting.id);

  return (
    <PageContainer>
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          href="/updates?tab=sightings"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回动态
        </Link>
      </div>

      <article className="mx-auto max-w-2xl">
        {/* 作者 + 日期 */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <EditableText
            value={sighting.authorName}
            entityType="sighting"
            entityId={sighting.id}
            field="authorName"
            as="span"
          >
            <Tag active>{sighting.authorName}</Tag>
          </EditableText>
          {sighting.sightedAt && (
            <time className="text-sm text-text-muted">
              {new Date(sighting.sightedAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          <UpdateItemVisibilityToggle
            type="sighting"
            id={sighting.id}
            isVisible={sighting.isVisible}
          />
        </div>

        {/* 标题 */}
        <EditableText
          value={sighting.title}
          entityType="sighting"
          entityId={sighting.id}
          field="title"
          as="h1"
          placeholder="点击补充标题"
          className="font-heading text-2xl font-semibold text-text-primary md:text-3xl"
        >
          {sighting.title}
        </EditableText>

        {/* 金线分隔 */}
        <div className="my-6">
          <div className="gold-line" />
        </div>

        {/* 缩略图 */}
        {sighting.thumbnailUrl && (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src={sighting.thumbnailUrl}
              alt={sighting.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        {/* 概要/内容 */}
        <EditableText
          value={sighting.content || sighting.summary}
          entityType="sighting"
          entityId={sighting.id}
          field={sighting.content ? 'content' : 'summary'}
          as="div"
          multiline
          placeholder="点击补充正文或摘要"
          className="text-text-secondary leading-relaxed"
        >
          {sighting.content || sighting.summary ? (
            <MarkdownContent
              content={sighting.content || sighting.summary}
              className="text-text-secondary leading-relaxed"
            />
          ) : null}
        </EditableText>

        <div className="mt-8">
          <EditableMediaGallery
            media={sighting.mediaItems}
            entityType="sighting"
            entityId={sighting.id}
            relation="media"
          />
        </div>

        {/* 标签 */}
        {sighting.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {sighting.tags.map((tag) => (
              <Tag key={tag.slug}>{tag.name}</Tag>
            ))}
          </div>
        )}

        {/* 查看原文按钮 */}
        {sighting.originalUrl && (
          <div className="mt-8">
            <a href={sighting.originalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary">查看原文 &#8599;</Button>
            </a>
          </div>
        )}
        <RelatedContentList items={relatedContent} />
        <ContentRelationEditor sourceType="sighting" sourceId={sighting.id} />
      </article>
    </PageContainer>
  );
}
