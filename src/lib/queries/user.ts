import { prisma } from '@/lib/db';
import type { PaginatedResponse } from '@/lib/types';

const PAGE_SIZE = 12;

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  postsCount: number;
  receivedLikesCount: number;
  receivedCommentsCount: number;
  givenLikesCount: number;
  givenCommentsCount: number;
  starlight: number;
  createdAt: string;
}

export interface UserMessageItem {
  id: string;
  tab: string;
  nickname: string;
  content: string;
  storyTags: string[];
  relatedYear: number | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

// 获取用户个人资料（不含 password）
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      postsCount: true,
      receivedLikesCount: true,
      receivedCommentsCount: true,
      givenLikesCount: true,
      givenCommentsCount: true,
      starlight: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };
}

// 获取用户的留言列表
export async function getUserMessages(
  userId: string,
  options?: { page?: number; pageSize?: number },
): Promise<PaginatedResponse<UserMessageItem>> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? PAGE_SIZE;

  const where = {
    userId,
    status: { not: 'REJECTED' as const },
  };

  const [rawItems, totalCount] = await Promise.all([
    prisma.guestbook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.guestbook.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // 批量查询每条留言的评论数
  const itemIds = rawItems.map((item) => item.id);
  const commentCounts = await prisma.comment.groupBy({
    by: ['targetId'],
    where: { targetType: 'guestbook', targetId: { in: itemIds } },
    _count: { id: true },
  });
  const commentCountMap = new Map(commentCounts.map((c) => [c.targetId, c._count.id]));

  const items: UserMessageItem[] = rawItems.map((item) => ({
    id: item.id,
    tab: item.tab.toLowerCase(),
    nickname: item.nickname,
    content: item.content,
    storyTags: item.storyTags,
    relatedYear: item.relatedYear,
    likesCount: item.likesCount,
    commentsCount: commentCountMap.get(item.id) ?? 0,
    createdAt: item.createdAt.toISOString(),
  }));

  return { items, totalCount, currentPage: page, totalPages, hasMore: page < totalPages };
}
