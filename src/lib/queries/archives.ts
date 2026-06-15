import { prisma } from '@/lib/db';
import type {
  PaginatedResponse,
  AlbumItem,
  AlbumDetail,
  MagazineItem,
  MagazineDetail,
} from '@/lib/types';

const PAGE_SIZE = 20;

const tagSelect = { select: { name: true, slug: true } } as const;

// 专辑列表（支持语言筛选 + 分页）
export async function getAlbums(options?: {
  language?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<AlbumItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: { isVisible: boolean; language?: string } = { isVisible: true };

  if (options?.language) {
    where.language = options.language;
  }

  const [rawItems, totalCount] = await Promise.all([
    prisma.album.findMany({
      where,
      orderBy: [
        { releaseDate: { sort: 'desc', nulls: 'last' } },
        { releaseYear: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        cover: { select: { url: true, width: true, height: true } },
        tags: tagSelect,
      },
    }),
    prisma.album.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: AlbumItem[] = rawItems.map(({ cover, ...rest }) => ({
    id: rest.id,
    slug: rest.slug,
    title: rest.title,
    releaseYear: rest.releaseYear,
    language: rest.language,
    coverUrl: cover?.url ?? null,
    coverWidth: cover?.width ?? null,
    coverHeight: cover?.height ?? null,
    tags: rest.tags,
  }));

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 专辑详情（通过 slug 查询）
export async function getAlbumBySlug(slug: string): Promise<AlbumDetail | null> {
  const raw = await prisma.album.findUnique({
    where: { slug },
    include: {
      cover: { select: { url: true, width: true, height: true } },
      tags: tagSelect,
    },
  });

  if (!raw) return null;

  const { cover, tracks, streamingLinks, ...rest } = raw;

  return {
    id: rest.id,
    slug: rest.slug,
    title: rest.title,
    releaseYear: rest.releaseYear,
    language: rest.language,
    coverUrl: cover?.url ?? null,
    coverWidth: cover?.width ?? null,
    coverHeight: cover?.height ?? null,
    tags: rest.tags,
    tracks: tracks as string[] | null,
    streamingLinks: streamingLinks as Record<string, string> | null,
  };
}

// 杂志列表（支持分页）
export async function getMagazines(options?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<MagazineItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where = { isVisible: true };

  const [rawItems, totalCount] = await Promise.all([
    prisma.magazine.findMany({
      where,
      orderBy: [{ date: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        cover: { select: { url: true, width: true, height: true } },
        tags: tagSelect,
      },
    }),
    prisma.magazine.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: MagazineItem[] = rawItems.map(({ cover, ...rest }) => ({
    id: rest.id,
    slug: rest.slug,
    title: rest.title,
    issue: rest.issue,
    date: rest.date,
    coverUrl: cover?.url ?? null,
    coverWidth: cover?.width ?? null,
    coverHeight: cover?.height ?? null,
    tags: rest.tags,
  }));

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 杂志详情（通过 slug 查询）
export async function getMagazineBySlug(slug: string): Promise<MagazineDetail | null> {
  const raw = await prisma.magazine.findUnique({
    where: { slug },
    include: {
      cover: { select: { url: true, width: true, height: true } },
      scans: { select: { url: true, alt: true } },
      tags: tagSelect,
    },
  });

  if (!raw) return null;

  const { cover, scans, ...rest } = raw;

  return {
    id: rest.id,
    slug: rest.slug,
    title: rest.title,
    issue: rest.issue,
    date: rest.date,
    coverUrl: cover?.url ?? null,
    coverWidth: cover?.width ?? null,
    coverHeight: cover?.height ?? null,
    tags: rest.tags,
    scans,
  };
}

// 资料库各类型数量统计
export async function getArchiveCounts(): Promise<{ album: number; magazine: number }> {
  const [album, magazine] = await Promise.all([
    prisma.album.count({ where: { isVisible: true } }),
    prisma.magazine.count({ where: { isVisible: true } }),
  ]);
  return { album, magazine };
}
