import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GuestbookTab } from '@/generated/prisma/client';
import { getGuestbookEntries } from '@/lib/queries/guestbook';
import { verifyUser } from '@/lib/auth';
import type { MessageTab } from '@/lib/types';

const validTabs: MessageTab[] = ['message', 'story', 'feedback'];
const tabMap: Record<MessageTab, GuestbookTab> = {
  message: GuestbookTab.MESSAGE,
  story: GuestbookTab.STORY,
  feedback: GuestbookTab.FEEDBACK,
};

// GET - 留言列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const tab = searchParams.get('tab') as MessageTab | null;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 12, 50);

    const data = await getGuestbookEntries({
      tab: tab && validTabs.includes(tab) ? tab : undefined,
      page,
      pageSize,
    });

    return NextResponse.json({
      data: data.items,
      pagination: {
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCount: data.totalCount,
        hasMore: data.hasMore,
      },
    });
  } catch (error) {
    console.error('获取留言列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建留言
export async function POST(request: NextRequest) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: { message: '请先登录', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, displayName: true, username: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: { message: '用户不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    const body = await request.json();

    // 必填字段验证
    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: { message: '内容为必填项', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const tab = body.tab as MessageTab;
    if (!tab || !validTabs.includes(tab)) {
      return NextResponse.json(
        { error: { message: '无效的留言类型', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const guestbook = await prisma.guestbook.create({
      data: {
        nickname: user.displayName || user.username,
        content: body.content.trim(),
        tab: tabMap[tab],
        storyTags: body.storyTags || [],
        relatedYear: body.relatedYear ? Number(body.relatedYear) : null,
        status: 'APPROVED',
        userId: user.id,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        postsCount: { increment: 1 },
        starlight: { increment: 5 },
      },
    });

    return NextResponse.json({ data: { id: guestbook.id, status: 'APPROVED' } }, { status: 201 });
  } catch (error) {
    console.error('创建留言失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
