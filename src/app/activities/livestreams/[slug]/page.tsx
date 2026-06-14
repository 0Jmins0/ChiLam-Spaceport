import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getLivestreamBySlug } from '@/lib/queries/activities';
import { EditableText } from '@/components/edit/EditableText';
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

      {/* Header section */}
      <div className="space-y-4 max-w-3xl">
        {/* Platform badge */}
        <Tag active>{platformLabel}</Tag>

        {/* Title */}
        <EditableText value={livestream.title} entityType="livestream" entityId={livestream.id} field="title" className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
            {livestream.title}
          </h1>
        </EditableText>

        {/* Meta info */}
        <p className="text-sm text-text-muted">
          {formatDate(livestream.date)}
          {livestream.duration != null && <span> · {livestream.duration}分钟</span>}
        </p>

        {/* Gold line */}
        <div className="gold-line" />

        {/* Summary */}
        <EditableText value={livestream.summary} entityType="livestream" entityId={livestream.id} field="summary" multiline placeholder="添加简介..." className="text-text-secondary leading-relaxed">
          {livestream.summary ? <p className="text-text-secondary leading-relaxed">{livestream.summary}</p> : null}
        </EditableText>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {livestream.originalUrl && (
            <a href={livestream.originalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                查看直播原链接 ↗
              </Button>
            </a>
          )}
          {livestream.replayUrl && (
            <a href={livestream.replayUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                观看回放 ↗
              </Button>
            </a>
          )}
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

      {/* Related info placeholder */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">相关资讯</h2>
        <p className="text-sm text-text-muted">即将上线，敬请期待</p>
      </div>
    </PageContainer>
  );
}
