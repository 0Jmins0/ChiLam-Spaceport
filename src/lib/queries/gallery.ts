import { prisma } from '@/lib/db';
import type {
  PaginatedResponse,
  GalleryItem,
  GalleryCollectionItem,
  GalleryCollectionDetail,
} from '@/lib/types';
import type { MediaCategory } from '@/generated/prisma/client';

const PAGE_SIZE = 24;

// 构建 Media 来源反查（从已有的关联关系推断来源）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveSource(media: any): { type: string; title: string; slug: string } | null {
  // 检查各个反向关联，返回第一个找到的
  if (media.posterOfProductions?.length > 0) {
    const p = media.posterOfProductions[0];
    return { type: 'production', title: p.title, slug: p.slug };
  }
  if (media.posterOfPerformances?.length > 0) {
    const p = media.posterOfPerformances[0];
    return { type: 'performance', title: p.title, slug: p.slug };
  }
  if (media.coverOfAlbums?.length > 0) {
    const a = media.coverOfAlbums[0];
    return { type: 'album', title: a.title, slug: a.slug };
  }
  if (media.coverOfMagazines?.length > 0) {
    const m = media.coverOfMagazines[0];
    return { type: 'magazine', title: m.title, slug: m.slug };
  }
  if (media.productionGalleries?.length > 0) {
    const p = media.productionGalleries[0];
    return { type: 'production', title: p.title, slug: p.slug };
  }
  if (media.endorsements?.length > 0) {
    const e = media.endorsements[0];
    return { type: 'endorsement', title: e.brand, slug: e.slug };
  }
  if (media.interviewGalleries?.length > 0) {
    const i = media.interviewGalleries[0];
    return { type: 'interview', title: i.title, slug: i.slug };
  }
  return null;
}

// 反查的 include 配置
const sourceInclude = {
  posterOfProductions: { select: { title: true, slug: true }, take: 1 },
  posterOfPerformances: { select: { title: true, slug: true }, take: 1 },
  coverOfAlbums: { select: { title: true, slug: true }, take: 1 },
  coverOfMagazines: { select: { title: true, slug: true }, take: 1 },
  productionGalleries: { select: { title: true, slug: true }, take: 1 },
  endorsements: { select: { brand: true, slug: true }, take: 1 },
  interviewGalleries: { select: { title: true, slug: true }, take: 1 },
} as const;

// Media → GalleryItem 转换
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGalleryItem(media: any): GalleryItem {
  return {
    id: media.id,
    type: media.type,
    category: media.category,
    mediaTag: media.mediaTag,
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    filename: media.filename,
    width: media.width,
    height: media.height,
    duration: media.duration,
    alt: media.alt,
    caption: media.caption,
    createdAt: media.createdAt.toISOString(),
    source: resolveSource(media),
  };
}

// Gallery 列表查询
export async function getGalleryItems(options?: {
  category?: MediaCategory;
  mediaTag?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<GalleryItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (options?.category) {
    where.category = options.category;
  }
  if (options?.mediaTag) {
    where.mediaTag = options.mediaTag;
  }

  const [rawItems, totalCount] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: sourceInclude,
    }),
    prisma.media.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    items: rawItems.map(toGalleryItem),
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// Gallery 各 category 数量
export async function getGalleryCounts(): Promise<{
  image: number;
  video: number;
  audio: number;
  collection: number;
}> {
  const [image, video, audio, collection] = await Promise.all([
    prisma.media.count({ where: { category: 'IMAGE' } }),
    prisma.media.count({ where: { category: 'VIDEO' } }),
    prisma.media.count({ where: { category: 'AUDIO' } }),
    prisma.mediaCollection.count({ where: { isVisible: true } }),
  ]);

  return { image, video, audio, collection };
}

// 单条 Media 详情（含所有反查来源）
export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  const media = await prisma.media.findUnique({
    where: { id },
    include: sourceInclude,
  });

  if (!media) return null;

  return toGalleryItem(media);
}

// 相册集列表
export async function getCollections(options?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<GalleryCollectionItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;

  const where = { isVisible: true };

  const [rawItems, totalCount] = await Promise.all([
    prisma.mediaCollection.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        cover: { select: { url: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.mediaCollection.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: GalleryCollectionItem[] = rawItems.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    date: c.date?.toISOString() ?? null,
    coverUrl: c.cover?.url ?? null,
    itemCount: c._count.items,
  }));

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 相册集详情
export async function getCollectionBySlug(slug: string): Promise<GalleryCollectionDetail | null> {
  const raw = await prisma.mediaCollection.findUnique({
    where: { slug },
    include: {
      cover: { select: { url: true } },
      items: {
        include: sourceInclude,
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { items: true } },
    },
  });

  if (!raw) return null;

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    date: raw.date?.toISOString() ?? null,
    coverUrl: raw.cover?.url ?? null,
    itemCount: raw._count.items,
    relatedType: raw.relatedType,
    relatedId: raw.relatedId,
    items: raw.items.map(toGalleryItem),
  };
}
