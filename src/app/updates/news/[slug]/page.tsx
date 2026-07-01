import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsArticleBySlug } from '@/lib/queries/updates';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import MarkdownContent from '@/components/ui/MarkdownContent';
import { EditableText } from '@/components/edit/EditableText';
import { EditableMediaGallery } from '@/components/edit/EditableMediaGallery';
import { DeleteEntryButton } from '@/components/edit/DeleteEntryButton';
import { UpdateItemVisibilityToggle } from '@/components/updates/UpdateItemVisibilityToggle';
import { RelatedContentList } from '@/components/relations/RelatedContentList';
import { ContentRelationEditor } from '@/components/relations/ContentRelationEditor';
import { getOutgoingRelatedContent } from '@/lib/content-relations';
import { getMediaAspectRatio, getUpdatePreviewMedia } from '@/lib/update-media';

// Next.js 16: params 是 Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);
  if (!article) return { title: '未找到' };
  return {
    title: article.title,
    description: article.summary || undefined,
  };
}

export default async function NewsArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);
  if (!article) notFound();
  const relatedContent = await getOutgoingRelatedContent('news_article', article.id);
  const previewMedia = getUpdatePreviewMedia(article.thumbnailUrl, article.mediaItems);
  const primaryMedia = article.mediaItems[0];

  return (
    <PageContainer>
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          href="/updates?tab=news"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回动态
        </Link>
      </div>
      <div className="mb-4 flex justify-end">
        <DeleteEntryButton entityType="newsArticle" entityId={article.id} />
      </div>

      <article className="mx-auto max-w-2xl">
        {/* 来源 + 日期 */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {article.source && (
            <EditableText
              value={article.source}
              entityType="newsArticle"
              entityId={article.id}
              field="source"
              as="span"
            >
              <Tag active>{article.source}</Tag>
            </EditableText>
          )}
          {article.publishedAt && (
            <time className="text-sm text-text-muted">
              {new Date(article.publishedAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          <UpdateItemVisibilityToggle type="news" id={article.id} isVisible={article.isVisible} />
        </div>

        {/* 标题 */}
        <EditableText
          value={article.title}
          entityType="newsArticle"
          entityId={article.id}
          field="title"
          as="h1"
          placeholder="点击补充标题"
          className="font-heading text-2xl font-semibold text-text-primary md:text-3xl"
        >
          {article.title}
        </EditableText>

        {/* 金线分隔 */}
        <div className="my-6">
          <div className="gold-line" />
        </div>

        {/* 首图/视频 */}
        {previewMedia?.url && (
          <div
            className="relative mb-6 w-full overflow-hidden rounded-[var(--radius-card)] bg-bg-darker"
            style={{ aspectRatio: getMediaAspectRatio(previewMedia) }}
          >
            {previewMedia.type === 'VIDEO' && primaryMedia ? (
              <video
                src={primaryMedia.url}
                poster={previewMedia.url}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src={previewMedia.url}
                alt={article.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            )}
          </div>
        )}

        {/* 概要/内容 */}
        <EditableText
          value={article.contentText || article.summary}
          entityType="newsArticle"
          entityId={article.id}
          field={article.contentText ? 'contentText' : 'summary'}
          as="div"
          multiline
          placeholder="点击补充正文或摘要"
          className="text-text-secondary leading-relaxed"
        >
          {article.contentText || article.summary ? (
            <MarkdownContent
              content={article.contentText || article.summary}
              className="text-text-secondary leading-relaxed"
            />
          ) : null}
        </EditableText>

        <div className="mt-8">
          <EditableMediaGallery
            media={article.mediaItems}
            entityType="newsArticle"
            entityId={article.id}
            relation="media"
          />
        </div>

        {/* 标签 */}
        {article.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Tag key={tag.slug}>{tag.name}</Tag>
            ))}
          </div>
        )}

        {/* 查看原文按钮 */}
        {article.originalUrl && (
          <div className="mt-8">
            <a href={article.originalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary">查看原文 &#8599;</Button>
            </a>
          </div>
        )}
        <RelatedContentList items={relatedContent} />
        <ContentRelationEditor sourceType="news_article" sourceId={article.id} />
      </article>
    </PageContainer>
  );
}
