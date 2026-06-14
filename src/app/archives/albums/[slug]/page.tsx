import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAlbumBySlug } from '@/lib/queries/archives';
import { EditableText } from '@/components/edit/EditableText';
import { EditableImage } from '@/components/edit/EditableImage';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) {
    return { title: '未找到' };
  }

  return {
    title: `${album.title} (${album.releaseYear})`,
    description: `${album.language ?? ''}专辑`,
  };
}

const streamingLabels: Record<string, string> = {
  spotify: 'Spotify',
  appleMusic: 'Apple Music',
  qqMusic: 'QQ音乐',
  neteaseMusic: '网易云音乐',
  youtube: 'YouTube Music',
  kugou: '酷狗音乐',
  kuwo: '酷我音乐',
};

export default async function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) notFound();

  return (
    <PageContainer>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/archives?tab=album"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回资料库
        </Link>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: cover */}
        <div className="w-full md:w-[300px] shrink-0">
          <EditableImage src={album.coverUrl} entityType="album" entityId={album.id} field="coverId">
            <div className="relative aspect-[1/1] overflow-hidden rounded-[var(--radius-card)]">
              {album.coverUrl ? (
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              ) : (
                <div className="absolute inset-0 bg-bg-darker flex items-center justify-center">
                  <span className="text-text-muted text-4xl">♪</span>
                </div>
              )}
            </div>
          </EditableImage>
        </div>

        {/* Right: info */}
        <div className="flex-1 space-y-4">
          {/* Language tag */}
          {album.language && <Tag active>{album.language}</Tag>}

          {/* Title */}
          <EditableText value={album.title} entityType="album" entityId={album.id} field="title" className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
            <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
              {album.title}
            </h1>
          </EditableText>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-1 text-sm text-text-muted">
            <EditableText value={album.releaseYear?.toString() || ''} entityType="album" entityId={album.id} field="releaseYear" placeholder="发行年份..." className="text-sm text-text-muted">
              {album.releaseYear ? <span>{album.releaseYear}</span> : null}
            </EditableText>
            {album.releaseYear && album.language && <span>·</span>}
            <EditableText value={album.language || ''} entityType="album" entityId={album.id} field="language" placeholder="语言..." className="text-sm text-text-muted">
              {album.language ? <span>{album.language}</span> : null}
            </EditableText>
          </div>

          {/* Gold line */}
          <div className="gold-line" />

          {/* Tracks */}
          {album.tracks && album.tracks.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-heading text-sm text-text-muted">曲目列表</h2>
              <ol className="list-decimal list-inside space-y-1">
                {album.tracks.map((track, i) => (
                  <li key={i} className="text-text-secondary text-sm">
                    {track}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Streaming links */}
          {album.streamingLinks && Object.keys(album.streamingLinks).length > 0 && (
            <div className="space-y-2">
              <h2 className="font-heading text-sm text-text-muted">在线收听</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(album.streamingLinks).map(([key, url]) => (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      {streamingLabels[key] || key} ↗
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {album.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {album.tags.map((tag) => (
                <Tag key={tag.slug}>{tag.name}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related content placeholder */}
      <div className="mt-8">
        <h2 className="font-heading text-lg text-text-primary mb-4">相关资讯</h2>
        <p className="text-sm text-text-muted">即将上线，敬请期待</p>
      </div>
    </PageContainer>
  );
}
