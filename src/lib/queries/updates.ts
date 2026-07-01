import { prisma } from '@/lib/db';
import { ModerationStatus } from '@/generated/prisma/client';
import type { SocialPostWhereInput } from '@/generated/prisma/models/SocialPost';
import type { NewsArticleWhereInput } from '@/generated/prisma/models/NewsArticle';
import type { SightingWhereInput } from '@/generated/prisma/models/Sighting';
import type { PaginatedResponse, SocialPostItem, NewsArticleItem, SightingItem } from '@/lib/types';

const PAGE_SIZE = 20;
export const UPDATE_CATEGORY_SLUGS = {
  root: 'updates',
  social: 'social-media',
  news: 'news',
  sighting: 'sighting',
} as const;

const tagSelect = { select: { name: true, slug: true } } as const;
const mediaPreviewSelect = {
  select: { id: true, url: true, type: true, alt: true, width: true, height: true },
  orderBy: { createdAt: 'asc' },
} as const;

export type UpdateCategoryState = {
  key: keyof typeof UPDATE_CATEGORY_SLUGS;
  slug: string;
  label: string;
  isVisible: boolean;
};

export type UpdateFilterOption = {
  label: string;
  value: string;
  count: number;
};

const CATEGORY_LABELS: Record<keyof typeof UPDATE_CATEGORY_SLUGS, string> = {
  root: '动态',
  social: '社交媒体',
  news: '新闻',
  sighting: '路透',
};

const platformLabels: Record<string, string> = {
  weibo: '微博',
  xiaohongshu: '小红书',
  douyin: '抖音',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

const fallbackSightingFilters = [
  { label: '机场', value: 'airport' },
  { label: '片场', value: 'set' },
  { label: '偶遇', value: 'encounter' },
  { label: '其他', value: 'other' },
];

// 社交帖列表（支持平台筛选 + 分页）
export async function getSocialPosts(options?: {
  platform?: string;
  page?: number;
  pageSize?: number;
  includeHidden?: boolean;
}): Promise<PaginatedResponse<SocialPostItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: SocialPostWhereInput = options?.includeHidden ? {} : { isVisible: true };

  if (options?.platform) {
    where.platform = options.platform;
  }

  const [items, totalCount] = await Promise.all([
    prisma.socialPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: tagSelect, mediaItems: mediaPreviewSelect },
    }),
    prisma.socialPost.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 新闻列表（分页）
export async function getNewsArticles(options?: {
  page?: number;
  pageSize?: number;
  includeHidden?: boolean;
}): Promise<PaginatedResponse<NewsArticleItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: NewsArticleWhereInput = options?.includeHidden ? {} : { isVisible: true };

  const [items, totalCount] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: tagSelect, mediaItems: mediaPreviewSelect },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 路透列表（排除 REJECTED，支持类型筛选）
export async function getSightings(options?: {
  sightingType?: string;
  page?: number;
  pageSize?: number;
  includeHidden?: boolean;
}): Promise<PaginatedResponse<SightingItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: SightingWhereInput = options?.includeHidden
    ? {}
    : { status: { not: ModerationStatus.REJECTED }, isVisible: true };

  if (options?.sightingType) {
    where.tags = { some: { slug: options.sightingType } };
  }

  const [items, totalCount] = await Promise.all([
    prisma.sighting.findMany({
      where,
      orderBy: { sightedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: tagSelect, mediaItems: mediaPreviewSelect },
    }),
    prisma.sighting.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 各 tab 的数量统计
export async function getUpdateCounts() {
  const [socialCount, newsCount, sightingCount] = await Promise.all([
    prisma.socialPost.count({ where: { isVisible: true } }),
    prisma.newsArticle.count({ where: { isVisible: true } }),
    prisma.sighting.count({
      where: { status: { not: ModerationStatus.REJECTED }, isVisible: true },
    }),
  ]);
  return { social: socialCount, news: newsCount, sighting: sightingCount };
}

export async function getUpdateCategoryStates(): Promise<UpdateCategoryState[]> {
  const entries = Object.entries(UPDATE_CATEGORY_SLUGS) as [
    keyof typeof UPDATE_CATEGORY_SLUGS,
    string,
  ][];
  const categories = await prisma.category.findMany({
    where: { slug: { in: entries.map(([, slug]) => slug) } },
    select: { slug: true, isVisible: true },
  });
  const visibilityBySlug = new Map(categories.map((category) => [category.slug, category.isVisible]));

  return entries.map(([key, slug]) => ({
    key,
    slug,
    label: CATEGORY_LABELS[key],
    isVisible: visibilityBySlug.get(slug) ?? true,
  }));
}

export async function getUpdateFilterOptions(options?: {
  includeHidden?: boolean;
}): Promise<{ platforms: UpdateFilterOption[]; sightingTypes: UpdateFilterOption[] }> {
  const includeHidden = options?.includeHidden ?? false;
  const socialWhere: SocialPostWhereInput = includeHidden ? {} : { isVisible: true };
  const sightingWhere: SightingWhereInput = includeHidden
    ? {}
    : { status: { not: ModerationStatus.REJECTED }, isVisible: true };

  const [platformGroups, platformTags, sightingTags] = await Promise.all([
    prisma.socialPost.groupBy({
      by: ['platform'],
      where: socialWhere,
      _count: { _all: true },
      orderBy: { platform: 'asc' },
    }),
    prisma.tag.findMany({
      where: { tagGroup: 'platform' },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.tag.findMany({
      where: { tagGroup: 'sighting_scene' },
      select: {
        name: true,
        slug: true,
        _count: { select: { sightings: { where: sightingWhere } } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const platformCountByValue = new Map(
    platformGroups.map((group) => [group.platform, group._count._all]),
  );
  const platformValueSet = new Set([
    ...platformTags.map((tag) => tag.slug),
    ...platformGroups.map((group) => group.platform),
  ]);
  const platformOptions = Array.from(platformValueSet)
    .map((value) => ({
      label: platformTags.find((tag) => tag.slug === value)?.name ?? platformLabels[value] ?? value,
      value,
      count: platformCountByValue.get(value) ?? 0,
    }))
    .filter((option) => includeHidden || option.count > 0);

  const sightingOptions =
    sightingTags.length > 0
      ? sightingTags.map((tag) => ({
          label: tag.name,
          value: tag.slug,
          count: tag._count.sightings,
        }))
      : fallbackSightingFilters.map((filter) => ({ ...filter, count: 0 }));

  return {
    platforms: platformOptions,
    sightingTypes: sightingOptions.filter((option) => includeHidden || option.count > 0),
  };
}

// 获取单条社交帖详情
export async function getSocialPostById(id: string, options?: { includeHidden?: boolean }) {
  return prisma.socialPost.findFirst({
    where: { id, ...(options?.includeHidden ? {} : { isVisible: true }) },
    include: { tags: tagSelect, mediaItems: mediaPreviewSelect },
  });
}

// 获取单条新闻详情
export async function getNewsArticleBySlug(slug: string, options?: { includeHidden?: boolean }) {
  return prisma.newsArticle.findFirst({
    where: { slug, ...(options?.includeHidden ? {} : { isVisible: true }) },
    include: { tags: tagSelect, mediaItems: mediaPreviewSelect },
  });
}

// 获取单条路透详情
export async function getSightingBySlug(slug: string, options?: { includeHidden?: boolean }) {
  return prisma.sighting.findFirst({
    where: {
      slug,
      ...(options?.includeHidden
        ? {}
        : { status: { not: ModerationStatus.REJECTED }, isVisible: true }),
    },
    include: { tags: tagSelect, mediaItems: mediaPreviewSelect },
  });
}
