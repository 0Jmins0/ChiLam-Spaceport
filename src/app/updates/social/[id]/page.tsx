import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSocialPostById } from '@/lib/queries/updates';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

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
        <div className="mb-4 flex items-center gap-3">
          <Tag active>{platformLabels[post.platform] || post.platform}</Tag>
          {post.publishedAt && (
            <time className="text-sm text-text-muted">
              {new Date(post.publishedAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </div>

        {/* 标题 */}
        {post.title && (
          <h1 className="font-heading text-2xl font-semibold text-text-primary md:text-3xl">
            {post.title}
          </h1>
        )}

        {/* 金线分隔 */}
        <div className="my-6">
          <div className="gold-line" />
        </div>

        {/* 缩略图 */}
        {post.thumbnailUrl && (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src={post.thumbnailUrl}
              alt={post.title || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        {/* 概要/内容 */}
        {(post.contentText || post.summary) && (
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
              {post.contentText || post.summary}
            </p>
          </div>
        )}

        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag.slug}>{tag.name}</Tag>
            ))}
          </div>
        )}

        {/* 查看原文按钮 */}
        <div className="mt-8">
          <a href={post.originalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary">查看原文 &#8599;</Button>
          </a>
        </div>
      </article>
    </PageContainer>
  );
}
