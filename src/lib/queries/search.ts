import { prisma } from '@/lib/db';
import { ModerationStatus } from '@/generated/prisma/client';
import type {
  SearchResultItem,
  SearchResultType,
  SearchPreviewResult,
  PaginatedResponse,
} from '@/lib/types';

const PREVIEW_LIMIT = 3;
const PAGE_SIZE = 20;

const TYPE_LABELS: Record<SearchResultType, string> = {
  social_post: '社交动态',
  news: '新闻报道',
  sighting: '路透',
  production: '影视综',
  performance: '演出',
  endorsement: '代言',
  interview: '访谈',
  livestream: '直播',
  album: '专辑',
  magazine: '杂志',
};

// ─── 各表搜索函数 ───

async function searchSocialPosts(q: string, take: number, skip: number = 0) {
  const where = {
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { summary: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.socialPost.findMany({ where, take, skip, orderBy: { publishedAt: 'desc' } }),
    prisma.socialPost.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'social_post' as const,
      id: item.id,
      title: item.title ?? item.summary?.slice(0, 50) ?? '',
      snippet: item.summary?.slice(0, 100) ?? null,
      url: `/updates/social/${item.id}`,
      date: item.publishedAt ? item.publishedAt.toISOString() : null,
      typeLabel: TYPE_LABELS.social_post,
    })),
    totalCount: count,
  };
}

async function searchNewsArticles(q: string, take: number, skip: number = 0) {
  const where = {
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { summary: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.newsArticle.findMany({ where, take, skip, orderBy: { publishedAt: 'desc' } }),
    prisma.newsArticle.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'news' as const,
      id: item.id,
      title: item.title,
      snippet: item.summary?.slice(0, 100) ?? null,
      url: `/updates/news/${item.slug}`,
      date: item.publishedAt ? item.publishedAt.toISOString() : null,
      typeLabel: TYPE_LABELS.news,
    })),
    totalCount: count,
  };
}

async function searchSightings(q: string, take: number, skip: number = 0) {
  const where = {
    status: { not: ModerationStatus.REJECTED },
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { summary: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.sighting.findMany({ where, take, skip, orderBy: { sightedAt: 'desc' } }),
    prisma.sighting.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'sighting' as const,
      id: item.id,
      title: item.title,
      snippet: item.summary?.slice(0, 100) ?? null,
      url: `/updates/sightings/${item.slug}`,
      date: item.sightedAt ? item.sightedAt.toISOString() : null,
      typeLabel: TYPE_LABELS.sighting,
    })),
    totalCount: count,
  };
}

async function searchProductions(q: string, take: number, skip: number = 0) {
  const where = {
    isVisible: true,
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { titleEn: { contains: q, mode: 'insensitive' as const } },
      { role: { contains: q, mode: 'insensitive' as const } },
      { synopsis: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.production.findMany({ where, take, skip, orderBy: { year: 'desc' } }),
    prisma.production.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'production' as const,
      id: item.id,
      title: item.title,
      snippet: item.synopsis?.slice(0, 100) ?? null,
      url: `/screens/${item.slug}`,
      date: item.year ? String(item.year) : null,
      typeLabel: TYPE_LABELS.production,
    })),
    totalCount: count,
  };
}

async function searchPerformances(q: string, take: number, skip: number = 0) {
  const where = {
    isVisible: true,
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { titleEn: { contains: q, mode: 'insensitive' as const } },
      { venue: { contains: q, mode: 'insensitive' as const } },
      { city: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.performance.findMany({ where, take, skip, orderBy: { startDate: 'desc' } }),
    prisma.performance.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'performance' as const,
      id: item.id,
      title: item.title,
      snippet: `${item.venue ?? ''} ${item.city ?? ''}`.trim().slice(0, 100) || null,
      url: `/performances/${item.slug}`,
      date: item.startDate ? item.startDate.toISOString() : null,
      typeLabel: TYPE_LABELS.performance,
    })),
    totalCount: count,
  };
}

async function searchEndorsements(q: string, take: number, skip: number = 0) {
  const where = {
    isVisible: true,
    OR: [
      { brand: { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } },
      { category: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.endorsement.findMany({ where, take, skip, orderBy: { startYear: 'desc' } }),
    prisma.endorsement.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'endorsement' as const,
      id: item.id,
      title: item.brand,
      snippet: item.description?.slice(0, 100) ?? null,
      url: `/activities/endorsements/${item.slug}`,
      date: item.startYear ? String(item.startYear) : null,
      typeLabel: TYPE_LABELS.endorsement,
    })),
    totalCount: count,
  };
}

async function searchInterviews(q: string, take: number, skip: number = 0) {
  const where = {
    isVisible: true,
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { summary: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.interview.findMany({ where, take, skip, orderBy: { date: 'desc' } }),
    prisma.interview.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'interview' as const,
      id: item.id,
      title: item.title,
      snippet: item.summary?.slice(0, 100) ?? null,
      url: `/activities/interviews/${item.slug}`,
      date: item.date.toISOString(),
      typeLabel: TYPE_LABELS.interview,
    })),
    totalCount: count,
  };
}

async function searchLivestreams(q: string, take: number, skip: number = 0) {
  const where = {
    isVisible: true,
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { summary: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.livestream.findMany({ where, take, skip, orderBy: { date: 'desc' } }),
    prisma.livestream.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'livestream' as const,
      id: item.id,
      title: item.title,
      snippet: item.summary?.slice(0, 100) ?? null,
      url: `/activities/livestreams/${item.slug}`,
      date: item.date.toISOString(),
      typeLabel: TYPE_LABELS.livestream,
    })),
    totalCount: count,
  };
}

async function searchAlbums(q: string, take: number, skip: number = 0) {
  const where = {
    isVisible: true,
    OR: [{ title: { contains: q, mode: 'insensitive' as const } }],
  };
  const [items, count] = await Promise.all([
    prisma.album.findMany({ where, take, skip, orderBy: { releaseYear: 'desc' } }),
    prisma.album.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'album' as const,
      id: item.id,
      title: item.title,
      snippet: null,
      url: `/archives/albums/${item.slug}`,
      date: item.releaseYear ? String(item.releaseYear) : null,
      typeLabel: TYPE_LABELS.album,
    })),
    totalCount: count,
  };
}

async function searchMagazines(q: string, take: number, skip: number = 0) {
  const where = {
    isVisible: true,
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { issue: { contains: q, mode: 'insensitive' as const } },
    ],
  };
  const [items, count] = await Promise.all([
    prisma.magazine.findMany({ where, take, skip, orderBy: { date: 'desc' } }),
    prisma.magazine.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      type: 'magazine' as const,
      id: item.id,
      title: item.title,
      snippet: item.issue ?? null,
      url: `/archives/magazines/${item.slug}`,
      date: item.date.toISOString(),
      typeLabel: TYPE_LABELS.magazine,
    })),
    totalCount: count,
  };
}

// ─── 搜索函数映射 ───

const SEARCH_FNS: Record<
  SearchResultType,
  (
    q: string,
    take: number,
    skip?: number,
  ) => Promise<{ items: SearchResultItem[]; totalCount: number }>
> = {
  social_post: searchSocialPosts,
  news: searchNewsArticles,
  sighting: searchSightings,
  production: searchProductions,
  performance: searchPerformances,
  endorsement: searchEndorsements,
  interview: searchInterviews,
  livestream: searchLivestreams,
  album: searchAlbums,
  magazine: searchMagazines,
};

const ALL_TYPES: SearchResultType[] = [
  'social_post',
  'news',
  'sighting',
  'production',
  'performance',
  'endorsement',
  'interview',
  'livestream',
  'album',
  'magazine',
];

// ─── 导出函数 ───

export async function searchPreview(q: string): Promise<SearchPreviewResult> {
  const results = await Promise.all(ALL_TYPES.map((type) => SEARCH_FNS[type](q, PREVIEW_LIMIT)));

  const groups = ALL_TYPES.map((type, i) => ({
    type,
    typeLabel: TYPE_LABELS[type],
    items: results[i].items,
    totalCount: results[i].totalCount,
  })).filter((g) => g.totalCount > 0);

  const totalCount = groups.reduce((sum, g) => sum + g.totalCount, 0);

  return { groups, totalCount };
}

export async function searchFull(options: {
  q: string;
  type?: SearchResultType | 'all';
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<SearchResultItem>> {
  const { q, type = 'all', page = 1, pageSize = PAGE_SIZE } = options;
  const skip = (page - 1) * pageSize;

  if (type !== 'all') {
    const searchFn = SEARCH_FNS[type];
    const result = await searchFn(q, pageSize, skip);
    const totalPages = Math.ceil(result.totalCount / pageSize);
    return {
      items: result.items,
      totalCount: result.totalCount,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  // 全类型搜索：并行查所有表的总数和当前页数据
  const counts = await Promise.all(ALL_TYPES.map((t) => SEARCH_FNS[t](q, 0)));
  const totalCount = counts.reduce((sum, r) => sum + r.totalCount, 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  // 收集所有结果并按日期排序，然后手动分页
  const allResults = await Promise.all(
    ALL_TYPES.map((t) => SEARCH_FNS[t](q, counts[ALL_TYPES.indexOf(t)].totalCount)),
  );
  const allItems = allResults
    .flatMap((r) => r.items)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });

  const paged = allItems.slice(skip, skip + pageSize);

  return {
    items: paged,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}
