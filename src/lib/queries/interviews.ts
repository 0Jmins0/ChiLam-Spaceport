import { prisma } from '@/lib/db';
import { InterviewMediaType } from '@/generated/prisma/client';
import type { InterviewWhereInput } from '@/generated/prisma/models/Interview';
import type { PaginatedResponse, InterviewItem, InterviewDetail } from '@/lib/types';

const PAGE_SIZE = 20;

const tagSelect = { select: { name: true, slug: true } } as const;

// 合法的 InterviewMediaType 值集合
const validInterviewMediaTypes = new Set(Object.values(InterviewMediaType));

// 访谈列表（支持媒体类型筛选 + 分页）
export async function getInterviews(options?: {
  mediaType?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<InterviewItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const where: InterviewWhereInput = { isVisible: true };

  if (options?.mediaType && validInterviewMediaTypes.has(options.mediaType as InterviewMediaType)) {
    where.mediaType = options.mediaType as InterviewMediaType;
  }

  const [rawItems, totalCount] = await Promise.all([
    prisma.interview.findMany({
      where,
      orderBy: [{ date: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        tags: tagSelect,
        coverImage: { select: { url: true } },
      },
    }),
    prisma.interview.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: InterviewItem[] = rawItems.map((rest) => ({
    id: rest.id,
    slug: rest.slug,
    title: rest.title,
    summary: rest.summary,
    source: rest.source,
    host: rest.host,
    location: rest.location,
    duration: rest.duration,
    date: rest.date,
    mediaType: rest.mediaType,
    originalUrl: rest.originalUrl,
    tags: rest.tags,
    coverImageUrl: rest.coverImage?.url ?? null,
  }));

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 访谈详情（通过 slug 查询）
export async function getInterviewBySlug(slug: string): Promise<InterviewDetail | null> {
  const raw = await prisma.interview.findUnique({
    where: { slug },
    include: {
      tags: tagSelect,
      coverImage: { select: { url: true } },
      originalMedia: { select: { url: true } },
      gallery: { select: { id: true, url: true, alt: true, type: true } },
    },
  });

  if (!raw) return null;

  const { coverImage, originalMedia, gallery, ...rest } = raw;

  return {
    id: rest.id,
    slug: rest.slug,
    title: rest.title,
    summary: rest.summary,
    source: rest.source,
    host: rest.host,
    location: rest.location,
    duration: rest.duration,
    date: rest.date,
    mediaType: rest.mediaType,
    originalUrl: rest.originalUrl,
    tags: rest.tags,
    coverImageUrl: coverImage?.url ?? null,
    transcriptCantonese: rest.transcriptCantonese,
    transcriptMandarin: rest.transcriptMandarin,
    proofreadStatus: rest.proofreadStatus,
    originalMediaUrl: originalMedia?.url ?? null,
    embedUrl: rest.embedUrl ?? null,
    galleryImages: gallery,
  };
}

// 访谈各媒体类型数量统计
export async function getInterviewCounts() {
  const [total, video, audio, text] = await Promise.all([
    prisma.interview.count({ where: { isVisible: true } }),
    prisma.interview.count({ where: { isVisible: true, mediaType: 'VIDEO' } }),
    prisma.interview.count({ where: { isVisible: true, mediaType: 'AUDIO' } }),
    prisma.interview.count({ where: { isVisible: true, mediaType: 'TEXT' } }),
  ]);
  return { total, video, audio, text };
}
