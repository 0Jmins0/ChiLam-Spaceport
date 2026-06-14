import { prisma } from '@/lib/db';
import type { EndorsementWhereInput } from '@/generated/prisma/models/Endorsement';
import type {
  PaginatedResponse,
  EndorsementItem,
  EndorsementDetail,
  LivestreamItem,
  LivestreamDetail,
} from '@/lib/types';

const PAGE_SIZE = 20;

const tagSelect = { select: { name: true, slug: true } } as const;

// 代言列表（支持分页）
export async function getEndorsements(options?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<EndorsementItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: EndorsementWhereInput = { isVisible: true };

  const [rawItems, totalCount] = await Promise.all([
    prisma.endorsement.findMany({
      where,
      orderBy: [{ startDate: { sort: 'desc', nulls: 'last' } }, { startYear: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        media: { select: { url: true, alt: true, width: true, height: true } },
        tags: tagSelect,
      },
    }),
    prisma.endorsement.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: EndorsementItem[] = rawItems.map(({ media, ...rest }) => ({
    id: rest.id,
    slug: rest.slug,
    brand: rest.brand,
    role: rest.role,
    category: rest.category,
    description: rest.description,
    startYear: rest.startYear,
    endYear: rest.endYear,
    mediaUrls: media,
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

// 代言详情（通过 slug 查询）
export async function getEndorsementBySlug(slug: string): Promise<EndorsementDetail | null> {
  const raw = await prisma.endorsement.findUnique({
    where: { slug },
    include: {
      media: { select: { url: true, alt: true, width: true, height: true } },
      tags: tagSelect,
    },
  });

  if (!raw) return null;

  const { media, ...rest } = raw;

  return {
    id: rest.id,
    slug: rest.slug,
    brand: rest.brand,
    role: rest.role,
    category: rest.category,
    description: rest.description,
    startYear: rest.startYear,
    endYear: rest.endYear,
    mediaUrls: media,
    tags: rest.tags,
  };
}

// 直播列表（支持平台筛选 + 分页）
export async function getLivestreams(options?: {
  platform?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<LivestreamItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: Record<string, unknown> = { isVisible: true };

  if (options?.platform) {
    where.platform = options.platform;
  }

  const [rawItems, totalCount] = await Promise.all([
    prisma.livestream.findMany({
      where,
      orderBy: [{ date: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        coverImage: { select: { url: true } },
        tags: tagSelect,
      },
    }),
    prisma.livestream.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: LivestreamItem[] = rawItems.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    platform: item.platform,
    date: item.date.toISOString(),
    summary: item.summary,
    originalUrl: item.originalUrl,
    replayUrl: item.replayUrl,
    duration: item.duration,
    coverImageUrl: item.coverImage?.url ?? null,
    tags: item.tags,
  }));

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 直播详情（通过 slug 查询）
export async function getLivestreamBySlug(slug: string): Promise<LivestreamDetail | null> {
  const raw = await prisma.livestream.findUnique({
    where: { slug },
    include: {
      coverImage: { select: { url: true } },
      media: { select: { url: true, type: true } },
      tags: tagSelect,
    },
  });

  if (!raw) return null;

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    platform: raw.platform,
    date: raw.date.toISOString(),
    summary: raw.summary,
    originalUrl: raw.originalUrl,
    replayUrl: raw.replayUrl,
    duration: raw.duration,
    coverImageUrl: raw.coverImage?.url ?? null,
    tags: raw.tags,
    media: raw.media.map((m) => ({ url: m.url, type: m.type })),
  };
}

// 各类型数量统计
export async function getActivityCounts() {
  const [endorsement, livestream] = await Promise.all([
    prisma.endorsement.count({ where: { isVisible: true } }),
    prisma.livestream.count({ where: { isVisible: true } }),
  ]);
  return { endorsement, livestream };
}
