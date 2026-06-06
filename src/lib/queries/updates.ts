import { prisma } from '@/lib/db';
import { ModerationStatus } from '@/generated/prisma/client';
import type {
  SocialPostWhereInput,
  NewsArticleWhereInput,
  SightingWhereInput,
} from '@/generated/prisma/models';
import type { PaginatedResponse, SocialPostItem, NewsArticleItem, SightingItem } from '@/lib/types';

const PAGE_SIZE = 20;

const tagSelect = { select: { name: true, slug: true } } as const;

// 社交帖列表（支持平台筛选 + 分页）
export async function getSocialPosts(options?: {
  platform?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<SocialPostItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: SocialPostWhereInput = {};

  if (options?.platform) {
    where.tags = { some: { slug: options.platform } };
  }

  const [items, totalCount] = await Promise.all([
    prisma.socialPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: tagSelect },
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
}): Promise<PaginatedResponse<NewsArticleItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: NewsArticleWhereInput = {};

  const [items, totalCount] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: tagSelect },
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

// 路透列表（只显示 APPROVED，支持类型筛选）
export async function getSightings(options?: {
  sightingType?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<SightingItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: SightingWhereInput = { status: ModerationStatus.APPROVED };

  if (options?.sightingType) {
    where.tags = { some: { slug: options.sightingType } };
  }

  const [items, totalCount] = await Promise.all([
    prisma.sighting.findMany({
      where,
      orderBy: { sightedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: tagSelect },
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
    prisma.socialPost.count(),
    prisma.newsArticle.count(),
    prisma.sighting.count({ where: { status: ModerationStatus.APPROVED } }),
  ]);
  return { social: socialCount, news: newsCount, sighting: sightingCount };
}

// 获取单条社交帖详情
export async function getSocialPostById(id: string) {
  return prisma.socialPost.findUnique({
    where: { id },
    include: { tags: tagSelect },
  });
}

// 获取单条新闻详情
export async function getNewsArticleBySlug(slug: string) {
  return prisma.newsArticle.findUnique({
    where: { slug },
    include: { tags: tagSelect },
  });
}

// 获取单条路透详情
export async function getSightingBySlug(slug: string) {
  return prisma.sighting.findUnique({
    where: { slug },
    include: { tags: tagSelect },
  });
}
