import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UpdatesFilterBar } from '@/components/updates/UpdatesFilterBar';
import { SocialPostCard } from '@/components/updates/SocialPostCard';
import { NewsArticleCard } from '@/components/updates/NewsArticleCard';
import { SightingCard } from '@/components/updates/SightingCard';
import { MasonryLayout } from '@/components/ui/MasonryLayout';
import { Pagination } from '@/components/updates/Pagination';
import {
  getSocialPosts,
  getNewsArticles,
  getSightings,
  getUpdateCounts,
} from '@/lib/queries/updates';

export const dynamic = 'force-dynamic';

export const metadata = { title: '动态' };

/**
 * Build a baseUrl string (without the page param) for the Pagination component.
 */
function buildBaseUrl(tab: string, platform?: string, sightingType?: string): string {
  const params = new URLSearchParams();
  params.set('tab', tab);
  if (platform) params.set('platform', platform);
  if (sightingType) params.set('sightingType', sightingType);
  return `/updates?${params.toString()}`;
}

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    platform?: string;
    sightingType?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'social';
  const platform = params.platform;
  const sightingType = params.sightingType;
  const page = Number(params.page) || 1;

  const counts = await getUpdateCounts();
  const baseUrl = buildBaseUrl(tab, platform, sightingType);

  let content;

  if (tab === 'social') {
    const data = await getSocialPosts({ platform, page });

    content =
      data.items.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-muted">暂无内容</p>
      ) : (
        <>
          <MasonryLayout>
            {data.items.map((post, index) => (
              <SocialPostCard
                key={post.id}
                id={post.id}
                platform={post.platform}
                originalUrl={post.originalUrl}
                title={post.title ?? undefined}
                summary={post.summary ?? undefined}
                thumbnailUrl={post.thumbnailUrl ?? undefined}
                publishedAt={post.publishedAt ?? (post as unknown as { createdAt: Date }).createdAt}
                tags={post.tags.map((t) => t.name)}
                priority={index < 3}
              />
            ))}
          </MasonryLayout>
          {data.totalPages > 1 && (
            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              baseUrl={baseUrl}
            />
          )}
        </>
      );
  } else if (tab === 'news') {
    const data = await getNewsArticles({ page });

    content =
      data.items.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-muted">暂无内容</p>
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((article, index) => (
              <NewsArticleCard
                key={article.id}
                id={article.id}
                slug={article.slug}
                originalUrl={article.originalUrl}
                title={article.title}
                summary={article.summary ?? undefined}
                source={article.source ?? undefined}
                thumbnailUrl={article.thumbnailUrl ?? undefined}
                publishedAt={
                  article.publishedAt ?? (article as unknown as { createdAt: Date }).createdAt
                }
                tags={article.tags.map((t) => t.name)}
                priority={index < 3}
              />
            ))}
          </div>
          {data.totalPages > 1 && (
            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              baseUrl={baseUrl}
            />
          )}
        </>
      );
  } else {
    const data = await getSightings({ sightingType, page });

    content =
      data.items.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-muted">暂无内容</p>
      ) : (
        <>
          <MasonryLayout>
            {data.items.map((sighting) => (
              <SightingCard
                key={sighting.id}
                id={sighting.id}
                slug={sighting.slug}
                originalUrl={sighting.originalUrl ?? undefined}
                title={sighting.title}
                summary={sighting.summary ?? undefined}
                thumbnailUrl={sighting.thumbnailUrl ?? undefined}
                sightedAt={
                  sighting.sightedAt ?? (sighting as unknown as { createdAt: Date }).createdAt
                }
                authorName={sighting.authorName}
                tags={sighting.tags.map((t) => t.name)}
              />
            ))}
          </MasonryLayout>
          {data.totalPages > 1 && (
            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              baseUrl={baseUrl}
            />
          )}
        </>
      );
  }

  return (
    <PageContainer>
      <PageHeader title="动态" titleEn="Updates" description="社交媒体 · 新闻报道 · 路透" />
      <UpdatesFilterBar
        currentTab={tab}
        currentPlatform={platform}
        currentSightingType={sightingType}
        counts={counts}
        className="mb-8"
      />
      {content}
    </PageContainer>
  );
}
