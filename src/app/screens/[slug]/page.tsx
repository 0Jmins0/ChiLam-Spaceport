import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProductionBySlug } from '@/lib/queries/productions';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

const typeLabels: Record<string, string> = {
  MOVIE: '电影',
  TV_SERIES: '电视剧',
  VARIETY_SHOW: '综艺',
};

const typeToTab: Record<string, string> = {
  MOVIE: 'movie',
  TV_SERIES: 'tv_series',
  VARIETY_SHOW: 'variety_show',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const production = await getProductionBySlug(slug);

  if (!production) {
    return { title: '未找到' };
  }

  return {
    title: `${production.title} (${production.year})`,
    description: production.synopsis || `${typeLabels[production.type]}作品`,
  };
}

export default async function ScreenDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const production = await getProductionBySlug(slug);

  if (!production) notFound();

  return (
    <PageContainer>
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          href={`/screens?tab=${typeToTab[production.type]}`}
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回影视综
        </Link>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左侧海报 */}
        <div className="w-full md:w-[300px] shrink-0">
          <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)]">
            {production.posterUrl ? (
              <Image
                src={production.posterUrl}
                alt={production.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            ) : (
              <div className="absolute inset-0 bg-bg-darker flex items-center justify-center">
                <span className="text-text-muted text-lg">{typeLabels[production.type]}</span>
              </div>
            )}
          </div>
        </div>

        {/* 右侧信息 */}
        <div className="flex-1 space-y-4">
          {/* 类型标签 */}
          <Tag active>{typeLabels[production.type]}</Tag>

          {/* 标题 */}
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
            {production.title}
          </h1>

          {/* 英文标题 */}
          {production.titleEn && (
            <p className="text-lg text-text-secondary">{production.titleEn}</p>
          )}

          {/* 元信息行 */}
          <p className="text-sm text-text-muted">
            {[production.year, production.role, production.language].filter(Boolean).join(' · ')}
          </p>

          {/* 综艺额外信息 */}
          {production.type === 'VARIETY_SHOW' &&
            (production.varietyRegion || production.varietyRole) && (
              <p className="text-sm text-text-muted">
                {[production.varietyRegion, production.varietyRole].filter(Boolean).join(' · ')}
              </p>
            )}

          {/* 金线分隔 */}
          <div className="gold-line" />

          {/* 简介 */}
          {production.synopsis && (
            <p className="text-text-secondary leading-relaxed">{production.synopsis}</p>
          )}

          {/* 播放平台链接 */}
          {production.watchLinks && production.watchLinks.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-heading text-sm text-text-muted">播放平台</h2>
              <div className="flex flex-wrap gap-2">
                {production.watchLinks.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      {link.platform} ↗
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 标签列表 */}
          {production.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {production.tags.map((tag) => (
                <Tag key={tag.slug}>{tag.name}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 图册区 */}
      {production.gallery.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-lg text-text-primary mb-4">图册</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {production.gallery.map((img, i) => (
              <div
                key={i}
                className="relative aspect-video overflow-hidden rounded-[var(--radius-card)]"
              >
                <Image
                  src={img.url}
                  alt={img.alt || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 相关资讯占位 */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">相关资讯</h2>
        <p className="text-sm text-text-muted">即将上线，敬请期待</p>
      </div>
    </PageContainer>
  );
}
