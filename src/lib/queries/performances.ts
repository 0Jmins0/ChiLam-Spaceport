import { prisma } from '@/lib/db';
import { PerformanceType } from '@/generated/prisma/client';
import type { PerformanceWhereInput } from '@/generated/prisma/models/Performance';
import type {
  PaginatedResponse,
  PerformanceItem,
  PerformanceDetail,
  GalleryMediaItem,
  LinkedProduction,
} from '@/lib/types';

const PAGE_SIZE = 20;

const tagSelect = { select: { name: true, slug: true } } as const;

// 合法的 PerformanceType 值集合
const validPerformanceTypes = new Set(Object.values(PerformanceType));

// 演出列表（支持类型 + 系列筛选 + 分页）
export async function getPerformances(options?: {
  type?: string;
  series?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<PerformanceItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: PerformanceWhereInput = { isVisible: true };

  if (options?.type && validPerformanceTypes.has(options.type as PerformanceType)) {
    where.type = options.type as PerformanceType;
  }

  if (options?.series) {
    where.series = options.series;
  }

  const [rawItems, totalCount] = await Promise.all([
    prisma.performance.findMany({
      where,
      orderBy: [
        { startDate: { sort: 'desc', nulls: 'last' } },
        { year: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        poster: { select: { url: true, width: true, height: true } },
        tags: tagSelect,
      },
    }),
    prisma.performance.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: PerformanceItem[] = rawItems.map(({ poster, ...rest }) => ({
    id: rest.id,
    type: rest.type,
    slug: rest.slug,
    title: rest.title,
    titleEn: rest.titleEn,
    year: rest.year,
    startDate: rest.startDate,
    endDate: rest.endDate,
    venue: rest.venue,
    city: rest.city,
    series: rest.series,
    posterUrl: poster?.url ?? null,
    posterWidth: poster?.width ?? null,
    posterHeight: poster?.height ?? null,
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

// 演出详情（通过 slug 查询）
export async function getPerformanceBySlug(slug: string): Promise<PerformanceDetail | null> {
  const raw = await prisma.performance.findUnique({
    where: { slug },
    include: {
      poster: { select: { url: true, width: true, height: true } },
      tags: tagSelect,
      officialMedia: {
        orderBy: { sortOrder: 'asc' },
        include: {
          media: { select: { url: true, type: true } },
        },
      },
      fanShots: {
        where: { status: { not: 'REJECTED' } },
        orderBy: { createdAt: 'desc' },
      },
      gallery: {
        select: {
          id: true,
          url: true,
          type: true,
          alt: true,
          width: true,
          height: true,
          mimeType: true,
          mediaTag: true,
        },
      },
    },
  });

  if (!raw) return null;

  // 查关联综艺
  const relations = await prisma.contentRelation.findMany({
    where: {
      sourceType: 'performance',
      sourceId: raw.id,
      targetType: 'production',
    },
  });

  let linkedProduction: LinkedProduction | null = null;
  if (relations.length > 0) {
    linkedProduction = await prisma.production.findUnique({
      where: { id: relations[0].targetId },
      select: { id: true, title: true, slug: true, type: true },
    });
  }

  const { poster, officialMedia, fanShots, gallery, setlist, ...rest } = raw;

  return {
    id: rest.id,
    type: rest.type,
    slug: rest.slug,
    title: rest.title,
    titleEn: rest.titleEn,
    year: rest.year,
    startDate: rest.startDate,
    endDate: rest.endDate,
    venue: rest.venue,
    city: rest.city,
    series: rest.series,
    posterUrl: poster?.url ?? null,
    posterWidth: poster?.width ?? null,
    posterHeight: poster?.height ?? null,
    tags: rest.tags,
    summary: rest.summary,
    setlist: setlist as string[] | null,
    officialMedia: officialMedia.map((om) => ({
      id: om.id,
      title: om.title,
      mediaUrl: om.media.url,
      mediaType: om.media.type,
    })),
    fanShots: fanShots.map((fs) => ({
      id: fs.id,
      title: fs.title,
      summary: fs.summary,
      originalUrl: fs.originalUrl,
      thumbnailUrl: fs.thumbnailUrl,
      authorName: fs.authorName,
    })),
    gallery: gallery as GalleryMediaItem[],
    linkedProduction,
  };
}

// 各类型数量统计
export async function getPerformanceCounts() {
  const [concert, stage, musical] = await Promise.all([
    prisma.performance.count({ where: { isVisible: true, type: PerformanceType.CONCERT } }),
    prisma.performance.count({ where: { isVisible: true, type: PerformanceType.STAGE } }),
    prisma.performance.count({ where: { isVisible: true, type: PerformanceType.MUSICAL } }),
  ]);
  return { concert, stage, musical };
}
