import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPerformanceBySlug } from '@/lib/queries/performances';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

const typeLabels: Record<string, string> = {
  CONCERT: '演唱会',
  STAGE: '舞台',
  MUSICAL: '音乐剧',
};

const typeToTab: Record<string, string> = {
  CONCERT: 'concert',
  STAGE: 'stage',
  MUSICAL: 'musical',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const performance = await getPerformanceBySlug(slug);

  if (!performance) {
    return { title: '未找到' };
  }

  return {
    title: `${performance.title} (${performance.year})`,
    description: performance.venue
      ? `${typeLabels[performance.type]} · ${performance.venue}`
      : typeLabels[performance.type],
  };
}

export default async function PerformanceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const performance = await getPerformanceBySlug(slug);

  if (!performance) notFound();

  return (
    <PageContainer>
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          href={`/performances?tab=${typeToTab[performance.type]}`}
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回演出
        </Link>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左侧海报 */}
        <div className="w-full md:w-[300px] shrink-0">
          <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)]">
            {performance.posterUrl ? (
              <Image
                src={performance.posterUrl}
                alt={performance.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            ) : (
              <div className="absolute inset-0 bg-bg-darker flex items-center justify-center">
                <span className="text-text-muted text-lg">{typeLabels[performance.type]}</span>
              </div>
            )}
          </div>
        </div>

        {/* 右侧信息 */}
        <div className="flex-1 space-y-4">
          {/* 类型标签 */}
          <Tag active>{typeLabels[performance.type]}</Tag>

          {/* 标题 */}
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
            {performance.title}
          </h1>

          {/* 英文标题 */}
          {performance.titleEn && (
            <p className="text-lg text-text-secondary">{performance.titleEn}</p>
          )}

          {/* 元信息行 */}
          <p className="text-sm text-text-muted">
            {[performance.year, performance.venue, performance.city, performance.series]
              .filter(Boolean)
              .join(' · ')}
          </p>

          {/* 金线分隔 */}
          <div className="gold-line" />

          {/* 标签列表 */}
          {performance.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {performance.tags.map((tag) => (
                <Tag key={tag.slug}>{tag.name}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 歌单区 */}
      {performance.setlist && performance.setlist.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-lg text-text-primary mb-4">歌单</h2>
          <ol className="list-decimal list-inside space-y-1">
            {performance.setlist.map((song, i) => (
              <li key={i} className="text-sm text-text-secondary">
                {song}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 官摄区 */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">官摄素材</h2>
        {performance.officialMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {performance.officialMedia.map((media) => (
              <div
                key={media.id}
                className="rounded-[var(--radius-card)] border border-border-gold/30 p-4"
              >
                <p className="text-sm text-text-primary">{media.title || '未命名素材'}</p>
                <p className="text-xs text-text-muted mt-1">{media.mediaType}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">官摄素材整理中，敬请期待</p>
        )}
      </div>

      {/* 饭拍区 */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">饭拍</h2>
        {performance.fanShots.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {performance.fanShots.map((shot) => (
              <div
                key={shot.id}
                className="rounded-[var(--radius-card)] border border-border-gold/30 p-4"
              >
                <p className="text-sm text-text-primary">{shot.title || '未命名饭拍'}</p>
                <p className="text-xs text-text-muted mt-1">by {shot.authorName}</p>
                {shot.summary && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{shot.summary}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">暂无饭拍投稿</p>
        )}
        <div className="mt-4">
          <Button variant="secondary" size="sm" disabled title="投稿功能即将上线">
            我要投稿饭拍
          </Button>
        </div>
      </div>

      {/* 相关资讯占位 */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">相关资讯</h2>
        <p className="text-sm text-text-muted">即将上线，敬请期待</p>
      </div>
    </PageContainer>
  );
}
