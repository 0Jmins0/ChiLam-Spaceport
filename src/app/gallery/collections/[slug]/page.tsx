import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { getCollectionBySlug } from '@/lib/queries/gallery';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: '未找到' };
  }

  return {
    title: `${collection.title} - 相册`,
    description: collection.description || `相册集：${collection.title}`,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) notFound();

  return (
    <PageContainer>
      {/* 返回链接 */}
      <div className="mb-6">
        <Link
          href="/gallery?tab=collection"
          className="text-sm text-text-secondary transition-colors hover:text-accent"
        >
          &larr; 返回相册
        </Link>
      </div>

      {/* 标题区域 */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-2 text-text-secondary">{collection.description}</p>
        )}
        <p className="mt-1 text-sm text-text-muted">
          {collection.itemCount} 项
          {collection.date && ` · ${new Date(collection.date).toLocaleDateString('zh-CN')}`}
        </p>
      </div>

      {/* 媒体网格 */}
      {collection.items.length > 0 ? (
        <GalleryGrid items={collection.items} />
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-text-muted">该相册集暂无内容</p>
        </div>
      )}
    </PageContainer>
  );
}
