import { prisma } from '@/lib/db';
import { AnnouncementType } from '@/generated/prisma/client';
import type {
  PaginatedResponse,
  AnnouncementItem,
  AnnouncementDetail,
  AnnouncementTab,
} from '@/lib/types';

const PAGE_SIZE = 20;

// AnnouncementTab → Prisma enum 映射
const tabToEnum: Record<AnnouncementTab, AnnouncementType> = {
  notice: AnnouncementType.NOTICE,
  rule: AnnouncementType.RULE,
  update: AnnouncementType.UPDATE,
};

// Prisma enum → AnnouncementTab 映射
function enumToTab(type: AnnouncementType): AnnouncementTab {
  switch (type) {
    case AnnouncementType.NOTICE:
      return 'notice';
    case AnnouncementType.RULE:
      return 'rule';
    case AnnouncementType.UPDATE:
      return 'update';
  }
}

// 公告列表（置顶优先，按 publishDate DESC）
export async function getAnnouncements(options?: {
  type?: AnnouncementTab;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<AnnouncementItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;

  const where: { type?: AnnouncementType } = {};
  if (options?.type && options.type in tabToEnum) {
    where.type = tabToEnum[options.type];
  }

  const [rawItems, totalCount] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { publishDate: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.announcement.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: AnnouncementItem[] = rawItems.map((row) => ({
    id: row.id,
    type: enumToTab(row.type),
    title: row.title,
    content: row.content,
    isPinned: row.isPinned,
    publishDate: row.publishDate.toISOString(),
  }));

  return {
    items,
    totalCount,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

// 公告详情
export async function getAnnouncementById(id: string): Promise<AnnouncementDetail | null> {
  const raw = await prisma.announcement.findUnique({ where: { id } });

  if (!raw) return null;

  return {
    id: raw.id,
    type: enumToTab(raw.type),
    title: raw.title,
    content: raw.content,
    isPinned: raw.isPinned,
    publishDate: raw.publishDate.toISOString(),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

// 各类型数量统计
export async function getAnnouncementCounts(): Promise<Record<AnnouncementTab, number>> {
  const [notice, rule, update] = await Promise.all([
    prisma.announcement.count({ where: { type: AnnouncementType.NOTICE } }),
    prisma.announcement.count({ where: { type: AnnouncementType.RULE } }),
    prisma.announcement.count({ where: { type: AnnouncementType.UPDATE } }),
  ]);

  return { notice, rule, update };
}
