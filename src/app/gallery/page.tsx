import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/updates/Pagination';
import { GalleryPageClient } from './GalleryPageClient';
import { getGalleryItems, getGalleryCounts, getCollections } from '@/lib/queries/gallery';
import type { MediaCategory } from '@/generated/prisma/client';

export const metadata = { title: '相册' };
export const dynamic = 'force-dynamic';

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; tag?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'image';
  const tag = params.tag || 'all';
  const page = Number(params.page) || 1;

  const counts = await getGalleryCounts();

  // 相册集 Tab
  if (tab === 'collection') {
    const collections = await getCollections({ page });

    const baseUrl = '/gallery?tab=collection';

    return (
      <PageContainer>
        <PageHeader title="相册" titleEn="Gallery" description="图片 · 视频 · 音频 · 合集" />

        <GalleryPageClient
          tab={tab}
          tag={tag}
          counts={counts}
          items={[]}
          collections={collections.items}
          totalPages={collections.totalPages}
          currentPage={page}
        />

        {collections.totalPages > 1 && (
          <Pagination currentPage={page} totalPages={collections.totalPages} baseUrl={baseUrl} />
        )}
      </PageContainer>
    );
  }

  // 媒体查询
  const categoryMap: Record<string, MediaCategory | undefined> = {
    image: 'IMAGE',
    video: 'VIDEO',
    audio: 'AUDIO',
  };
  const category = categoryMap[tab];
  const mediaTag = tag !== 'all' ? tag : undefined;

  const data = await getGalleryItems({ category, mediaTag, page, pageSize: 24 });

  const baseUrl = `/gallery?tab=${tab}${mediaTag ? `&tag=${mediaTag}` : ''}`;

  return (
    <PageContainer>
      <PageHeader title="相册" titleEn="Gallery" description="图片 · 视频 · 音频 · 合集" />

      <GalleryPageClient
        tab={tab}
        tag={tag}
        counts={counts}
        items={data.items}
        collections={[]}
        totalPages={data.totalPages}
        currentPage={page}
      />

      {data.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={data.totalPages} baseUrl={baseUrl} />
      )}
    </PageContainer>
  );
}
