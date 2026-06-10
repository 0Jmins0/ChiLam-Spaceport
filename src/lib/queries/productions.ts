import { prisma } from '@/lib/db';
import { ProductionType } from '@/generated/prisma/client';
import type { ProductionWhereInput } from '@/generated/prisma/models/Production';
import type { PaginatedResponse, ProductionItem, ProductionDetail } from '@/lib/types';

const PAGE_SIZE = 20;

const tagSelect = { select: { name: true, slug: true } } as const;

// 合法的 ProductionType 值集合
const validProductionTypes = new Set(Object.values(ProductionType));

// 影视作品列表（支持类型 + 年代筛选 + 分页）
export async function getProductions(options?: {
  type?: string;
  decade?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<ProductionItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: ProductionWhereInput = { isVisible: true };

  if (options?.type && validProductionTypes.has(options.type as ProductionType)) {
    where.type = options.type as ProductionType;
  }

  if (options?.decade) {
    const decadeStart = Number(options.decade);
    where.year = { gte: decadeStart, lt: decadeStart + 10 };
  }

  const [rawItems, totalCount] = await Promise.all([
    prisma.production.findMany({
      where,
      orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        poster: { select: { url: true, width: true, height: true } },
        tags: tagSelect,
      },
    }),
    prisma.production.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: ProductionItem[] = rawItems.map(({ poster, ...rest }) => ({
    id: rest.id,
    type: rest.type,
    slug: rest.slug,
    title: rest.title,
    titleEn: rest.titleEn,
    year: rest.year,
    role: rest.role,
    synopsis: rest.synopsis,
    posterUrl: poster?.url ?? null,
    posterWidth: poster?.width ?? null,
    posterHeight: poster?.height ?? null,
    language: rest.language,
    varietyRegion: rest.varietyRegion,
    varietyRole: rest.varietyRole,
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

// 影视作品详情（通过 slug 查询）
export async function getProductionBySlug(slug: string): Promise<ProductionDetail | null> {
  const raw = await prisma.production.findUnique({
    where: { slug },
    include: {
      poster: { select: { url: true, alt: true, width: true, height: true } },
      gallery: { select: { url: true, alt: true } },
      tags: tagSelect,
    },
  });

  if (!raw) return null;

  const { poster, gallery, watchLinks, ...rest } = raw;

  return {
    id: rest.id,
    type: rest.type,
    slug: rest.slug,
    title: rest.title,
    titleEn: rest.titleEn,
    year: rest.year,
    role: rest.role,
    synopsis: rest.synopsis,
    posterUrl: poster?.url ?? null,
    posterWidth: poster?.width ?? null,
    posterHeight: poster?.height ?? null,
    language: rest.language,
    varietyRegion: rest.varietyRegion,
    varietyRole: rest.varietyRole,
    tags: rest.tags,
    gallery,
    watchLinks: watchLinks as { platform: string; url: string }[] | null,
  };
}

// 各类型数量统计
export async function getProductionCounts() {
  const [movie, tvSeries, varietyShow] = await Promise.all([
    prisma.production.count({ where: { isVisible: true, type: ProductionType.MOVIE } }),
    prisma.production.count({ where: { isVisible: true, type: ProductionType.TV_SERIES } }),
    prisma.production.count({ where: { isVisible: true, type: ProductionType.VARIETY_SHOW } }),
  ]);
  return { movie, tv_series: tvSeries, variety_show: varietyShow };
}
