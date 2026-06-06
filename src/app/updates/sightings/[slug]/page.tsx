import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSightingBySlug } from '@/lib/queries/updates';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

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
        <div className="mb-4 flex items-center gap-3">
          <Tag active>{sighting.authorName}</Tag>
          {sighting.sightedAt && (
            <time className="text-sm text-text-muted">
              {new Date(sighting.sightedAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </div>

        {/* 标题 */}
        <h1 className="font-heading text-2xl font-semibold text-text-primary md:text-3xl">
          {sighting.title}
        </h1>

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
        {(sighting.content || sighting.summary) && (
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
              {sighting.content || sighting.summary}
            </p>
          </div>
        )}

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
      </article>
    </PageContainer>
  );
}
