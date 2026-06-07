import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArchivesFilterBar } from '@/components/archives/ArchivesFilterBar';
import { AlbumCard } from '@/components/archives/AlbumCard';
import { MagazineCard } from '@/components/archives/MagazineCard';
import { Pagination } from '@/components/updates/Pagination';
import { getAlbums, getMagazines, getArchiveCounts } from '@/lib/queries/archives';

export const metadata = { title: '资料库' };
export const dynamic = 'force-dynamic';

function buildBaseUrl(tab: string, language?: string): string {
  const params = new URLSearchParams();
  params.set('tab', tab);
  if (language) params.set('language', language);
  return `/archives?${params.toString()}`;
}

export default async function ArchivesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; language?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'album';
  const language = params.language;
  const page = Number(params.page) || 1;

  const [counts, albumData, magazineData] = await Promise.all([
    getArchiveCounts(),
    tab === 'album' ? getAlbums({ language, page }) : Promise.resolve(null),
    tab === 'magazine' ? getMagazines({ page }) : Promise.resolve(null),
  ]);

  const baseUrl = buildBaseUrl(tab, language);

  return (
    <PageContainer>
      <PageHeader title="资料库" titleEn="Archives" description="专辑 · 杂志" />

      <ArchivesFilterBar
        currentTab={tab}
        currentLanguage={language}
        counts={counts}
        className="mb-8"
      />

      {/* Album grid */}
      {tab === 'album' && albumData && (
        <>
          {albumData.items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albumData.items.map((item) => (
                <AlbumCard
                  key={item.id}
                  slug={item.slug}
                  title={item.title}
                  releaseYear={item.releaseYear}
                  language={item.language ?? undefined}
                  coverUrl={item.coverUrl ?? undefined}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-text-muted">暂无专辑</p>
            </div>
          )}

          {albumData.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={albumData.totalPages} baseUrl={baseUrl} />
          )}
        </>
      )}

      {/* Magazine grid */}
      {tab === 'magazine' && magazineData && (
        <>
          {magazineData.items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazineData.items.map((item) => (
                <MagazineCard
                  key={item.id}
                  slug={item.slug}
                  title={item.title}
                  issue={item.issue ?? undefined}
                  date={item.date}
                  coverUrl={item.coverUrl ?? undefined}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-text-muted">暂无杂志</p>
            </div>
          )}

          {magazineData.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={magazineData.totalPages} baseUrl={baseUrl} />
          )}
        </>
      )}
    </PageContainer>
  );
}
