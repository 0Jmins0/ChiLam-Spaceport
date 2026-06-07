import { prisma } from '@/lib/db';
import { GuestbookTab } from '@/generated/prisma/client';
import type {
  PaginatedResponse,
  GuestbookItem,
  GuestbookDetail,
  CommentItem,
  MessageTab,
} from '@/lib/types';

const PAGE_SIZE = 12;

// Tab 映射：前端 lowercase → Prisma enum
const tabMap: Record<MessageTab, GuestbookTab> = {
  message: GuestbookTab.MESSAGE,
  story: GuestbookTab.STORY,
  feedback: GuestbookTab.FEEDBACK,
};

// 反向映射
const reverseTabMap: Record<GuestbookTab, MessageTab> = {
  [GuestbookTab.MESSAGE]: 'message',
  [GuestbookTab.STORY]: 'story',
  [GuestbookTab.FEEDBACK]: 'feedback',
};

// 留言列表
export async function getGuestbookEntries(options?: {
  tab?: MessageTab;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<GuestbookItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;

  const where: { status: { not: 'REJECTED' }; tab?: GuestbookTab } = {
    status: { not: 'REJECTED' },
  };
  if (options?.tab && tabMap[options.tab]) {
    where.tab = tabMap[options.tab];
  }

  const [rawItems, totalCount] = await Promise.all([
    prisma.guestbook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.guestbook.count({ where }),
  ]);

  // 批量获取评论数
  const ids = rawItems.map((item) => item.id);
  const commentCounts = await prisma.comment.groupBy({
    by: ['targetId'],
    where: { targetType: 'guestbook', targetId: { in: ids } },
    _count: { id: true },
  });
  const countMap = new Map(commentCounts.map((c) => [c.targetId, c._count.id]));

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: GuestbookItem[] = rawItems.map((item) => ({
    id: item.id,
    tab: reverseTabMap[item.tab],
    nickname: item.nickname,
    content: item.content,
    storyTags: item.storyTags,
    relatedYear: item.relatedYear,
    likesCount: item.likesCount,
    commentsCount: countMap.get(item.id) ?? 0,
    createdAt: item.createdAt.toISOString(),
  }));

  return { items, totalCount, currentPage: page, totalPages, hasMore: page < totalPages };
}

// 留言详情
export async function getGuestbookById(id: string): Promise<GuestbookDetail | null> {
  const raw = await prisma.guestbook.findUnique({
    where: { id },
    include: { images: { select: { url: true, alt: true } } },
  });

  if (!raw || raw.status === 'REJECTED') return null;

  const commentsCount = await prisma.comment.count({
    where: { targetType: 'guestbook', targetId: id },
  });

  return {
    id: raw.id,
    tab: reverseTabMap[raw.tab],
    nickname: raw.nickname,
    content: raw.content,
    storyTags: raw.storyTags,
    relatedYear: raw.relatedYear,
    likesCount: raw.likesCount,
    commentsCount,
    createdAt: raw.createdAt.toISOString(),
    images: raw.images,
  };
}

// 各 tab 数量统计
export async function getGuestbookCounts(): Promise<Record<MessageTab, number>> {
  const [message, story, feedback] = await Promise.all([
    prisma.guestbook.count({ where: { status: { not: 'REJECTED' }, tab: 'MESSAGE' } }),
    prisma.guestbook.count({ where: { status: { not: 'REJECTED' }, tab: 'STORY' } }),
    prisma.guestbook.count({ where: { status: { not: 'REJECTED' }, tab: 'FEEDBACK' } }),
  ]);
  return { message, story, feedback };
}

// 评论列表
export async function getCommentsByTarget(
  targetType: string,
  targetId: string,
  page?: number,
): Promise<PaginatedResponse<CommentItem>> {
  const pageNum = page ?? 1;
  const pageSize = 20;

  const where = { targetType, targetId };

  const [rawItems, totalCount] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    }),
    prisma.comment.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const items: CommentItem[] = rawItems.map((item) => ({
    id: item.id,
    nickname: item.nickname,
    content: item.content,
    createdAt: item.createdAt.toISOString(),
  }));

  return { items, totalCount, currentPage: pageNum, totalPages, hasMore: pageNum < totalPages };
}
