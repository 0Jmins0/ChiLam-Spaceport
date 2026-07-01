import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSocialPostById } from '@/lib/queries/updates';
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
import { getMediaAspectRatio, getUpdatePreviewMedia } from '@/lib/update-media';

// Next.js 16: params 是 Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getSocialPostById(id);
  if (!post) return { title: '未找到' };
  return {
    title: post.title || '社交媒体动态',
    description: post.summary || undefined,
  };
}

export default async function SocialPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getSocialPostById(id);
  if (!post) notFound();
  const relatedContent = await getOutgoingRelatedContent('social_post', post.id);
  const previewMedia = getUpdatePreviewMedia(post.thumbnailUrl, post.mediaItems);
  const primaryMedia = post.mediaItems[0];

  // 平台中文名映射
  const platformLabels: Record<string, string> = {
    weibo: '微博',
    xiaohongshu: '小红书',
    douyin: '抖音',
    instagram: 'Instagram',
    facebook: 'Facebook',
  };

  return (
    <PageContainer>
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          href="/updates?tab=social"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回动态
        </Link>
      </div>

      <article className="mx-auto max-w-2xl">
        {/* 平台 + 日期 */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <EditableText
            value={post.platform}
            entityType="socialPost"
            entityId={post.id}
            field="platform"
            as="span"
          >
            <Tag active>{platformLabels[post.platform] || post.platform}</Tag>
          </EditableText>
          {post.publishedAt && (
            <time className="text-sm text-text-muted">
              {new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          <UpdateItemVisibilityToggle type="social" id={post.id} isVisible={post.isVisible} />
        </div>

        {/* 标题 */}
        <EditableText
          value={post.title}
          entityType="socialPost"
          entityId={post.id}
          field="title"
          as="h1"
          placeholder="点击补充标题"
          className="font-heading text-2xl font-semibold text-text-primary md:text-3xl"
        >
          {post.title}
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
                alt={post.title || ''}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            )}
          </div>
        )}

        {/* 概要/内容 */}
        <EditableText
          value={post.contentText || post.summary}
          entityType="socialPost"
          entityId={post.id}
          field={post.contentText ? 'contentText' : 'summary'}
          as="div"
          multiline
          placeholder="点击补充正文或摘要"
          className="text-text-secondary leading-relaxed"
        >
          {post.contentText || post.summary ? (
            <MarkdownContent
              content={post.contentText || post.summary}
              className="text-text-secondary leading-relaxed"
            />
          ) : null}
        </EditableText>

        <div className="mt-8">
          <EditableMediaGallery
            media={post.mediaItems}
            entityType="socialPost"
            entityId={post.id}
            relation="media"
          />
        </div>

        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag.slug}>{tag.name}</Tag>
            ))}
          </div>
        )}

        {/* 查看原文按钮 */}
        {post.originalUrl && (
          <div className="mt-8">
            <a href={post.originalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary">查看原文 &#8599;</Button>
            </a>
          </div>
        )}
        <RelatedContentList items={relatedContent} />
        <ContentRelationEditor sourceType="social_post" sourceId={post.id} />
      </article>
    </PageContainer>
  );
}
