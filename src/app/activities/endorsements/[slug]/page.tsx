import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getEndorsementBySlug } from '@/lib/queries/activities';
import { EditableText } from '@/components/edit/EditableText';
import { EditableImage } from '@/components/edit/EditableImage';
import { EditableMediaGallery } from '@/components/edit/EditableMediaGallery';
import { DeleteEntryButton } from '@/components/edit/DeleteEntryButton';
import MarkdownContent from '@/components/ui/MarkdownContent';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const endorsement = await getEndorsementBySlug(slug);

  if (!endorsement) {
    return { title: '未找到' };
  }

  return {
    title: `${endorsement.brand}`,
    description: endorsement.description || `${endorsement.brand} 代言活动`,
  };
}

export default async function EndorsementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const endorsement = await getEndorsementBySlug(slug);

  if (!endorsement) notFound();

  const startYear = endorsement.startYear ? String(endorsement.startYear) : '';
  const endYear = endorsement.endYear ? String(endorsement.endYear) : '';

  const coverUrl = endorsement.coverImageUrl || endorsement.mediaUrls[0]?.url || null;

  return (
    <PageContainer>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/activities?tab=endorsement"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回活动
        </Link>
      </div>
      <div className="mb-4 flex justify-end">
        <DeleteEntryButton entityType="endorsement" entityId={endorsement.id} />
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: cover */}
        <div className="w-full md:w-[400px] shrink-0">
          <EditableImage
            src={coverUrl}
            entityType="endorsement"
            entityId={endorsement.id}
            field="coverImageId"
            alt={endorsement.brand}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)]">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={endorsement.brand}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              ) : (
                <div className="absolute inset-0 bg-bg-darker flex items-center justify-center">
                  <span className="text-text-muted text-lg">{endorsement.brand}</span>
                </div>
              )}
            </div>
          </EditableImage>
        </div>

        {/* Right: info */}
        <div className="flex-1 space-y-4">
          {/* Category tag */}
          <EditableText
            value={endorsement.category || ''}
            entityType="endorsement"
            entityId={endorsement.id}
            field="category"
            placeholder="分类..."
            className="inline-block"
          >
            {endorsement.category ? <Tag active>{endorsement.category}</Tag> : null}
          </EditableText>

          {/* Brand name */}
          <EditableText
            value={endorsement.brand}
            entityType="endorsement"
            entityId={endorsement.id}
            field="brand"
            className="font-heading text-2xl md:text-3xl font-semibold text-text-primary"
          >
            <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
              {endorsement.brand}
            </h1>
          </EditableText>

          {/* Meta info */}
          <div className="text-sm text-text-muted flex flex-wrap items-center gap-1">
            <EditableText
              value={endorsement.role || ''}
              entityType="endorsement"
              entityId={endorsement.id}
              field="role"
              placeholder="角色..."
              className="inline"
            >
              {endorsement.role ? <span>{endorsement.role}</span> : null}
            </EditableText>
            {endorsement.role && startYear && <span> · </span>}
            <EditableText
              value={startYear}
              entityType="endorsement"
              entityId={endorsement.id}
              field="startYear"
              placeholder="开始年份..."
              className="inline"
            >
              {startYear ? <span>{startYear}</span> : null}
            </EditableText>
            {startYear && <span>-</span>}
            <EditableText
              value={endYear}
              entityType="endorsement"
              entityId={endorsement.id}
              field="endYear"
              placeholder="结束年份..."
              className="inline"
            >
              {endYear ? <span>{endYear}</span> : <span>至今</span>}
            </EditableText>
          </div>

          {/* Gold line */}
          <div className="gold-line" />

          {/* Description */}
          <EditableText
            value={endorsement.description}
            entityType="endorsement"
            entityId={endorsement.id}
            field="description"
            multiline
            placeholder="添加描述..."
            className="text-text-secondary leading-relaxed whitespace-pre-line"
          >
            {endorsement.description ? (
              <MarkdownContent
                content={endorsement.description}
                className="text-text-secondary leading-relaxed"
              />
            ) : null}
          </EditableText>

          {/* Tags */}
          {endorsement.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {endorsement.tags.map((tag) => (
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
          media={endorsement.mediaUrls}
          entityType="endorsement"
          entityId={endorsement.id}
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
