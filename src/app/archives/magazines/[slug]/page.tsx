import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getMagazineBySlug } from '@/lib/queries/archives';
import { EditableText } from '@/components/edit/EditableText';
import { EditableImage } from '@/components/edit/EditableImage';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';

function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const magazine = await getMagazineBySlug(slug);

  if (!magazine) {
    return { title: '未找到' };
  }

  return {
    title: magazine.issue ? `${magazine.title} - ${magazine.issue}` : magazine.title,
    description: `杂志 ${formatDate(magazine.date)}`,
  };
}

export default async function MagazineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const magazine = await getMagazineBySlug(slug);

  if (!magazine) notFound();

  return (
    <PageContainer>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/archives?tab=magazine"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回资料库
        </Link>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: cover */}
        <div className="w-full md:w-[300px] shrink-0">
          <EditableImage src={magazine.coverUrl} entityType="magazine" entityId={magazine.id} field="coverId">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)]">
              {magazine.coverUrl ? (
                <Image
                  src={magazine.coverUrl}
                  alt={magazine.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              ) : (
                <div className="absolute inset-0 bg-bg-darker flex items-center justify-center px-4">
                  <span className="text-center text-lg text-text-muted">{magazine.title}</span>
                </div>
              )}
            </div>
          </EditableImage>
        </div>

        {/* Right: info */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <EditableText value={magazine.title} entityType="magazine" entityId={magazine.id} field="title" className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
            <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
              {magazine.title}
            </h1>
          </EditableText>

          {/* Meta info */}
          <p className="text-sm text-text-muted">
            <EditableText value={magazine.issue || ''} entityType="magazine" entityId={magazine.id} field="issue" placeholder="期号..." className="inline">
              {magazine.issue && <span>{magazine.issue}</span>}
            </EditableText>
            {magazine.issue && <span> · </span>}
            <span>{formatDate(magazine.date)}</span>
          </p>

          {/* Gold line */}
          <div className="gold-line" />

          {/* Tags */}
          {magazine.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {magazine.tags.map((tag) => (
                <Tag key={tag.slug}>{tag.name}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scans gallery */}
      {magazine.scans.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-lg text-text-primary mb-4">内页扫描</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.scans.map((scan, i) => (
              <div
                key={i}
                className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)]"
              >
                <Image
                  src={scan.url}
                  alt={scan.alt || ''}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related content placeholder */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">相关资讯</h2>
        <p className="text-sm text-text-muted">即将上线，敬请期待</p>
      </div>
    </PageContainer>
  );
}
