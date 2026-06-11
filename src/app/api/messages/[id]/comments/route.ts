import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCommentsByTarget } from '@/lib/queries/guestbook';
import { verifyUser } from '@/lib/auth';

// GET - 获取评论列表
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;

    const data = await getCommentsByTarget('guestbook', id, page);

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
    console.error('获取评论列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建评论
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();

    // 验证
    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: { message: '内容为必填项', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    if (body.content.trim().length > 300) {
      return NextResponse.json(
        { error: { message: '评论内容不能超过300字', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    // 确认留言存在
    const guestbook = await prisma.guestbook.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!guestbook) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        targetType: 'guestbook',
        targetId: id,
        nickname: user.displayName || user.username,
        content: body.content.trim(),
        userId: user.id,
        ...(body.imageId ? { imageId: body.imageId } : {}),
      },
      include: {
        image: true,
      },
    });

    // 更新发评论者的统计
    await prisma.user.update({
      where: { id: user.id },
      data: {
        givenCommentsCount: { increment: 1 },
        starlight: { increment: 2 },
      },
    });

    // 如果留言有作者，更新收到评论的统计
    if (guestbook.userId) {
      await prisma.user.update({
        where: { id: guestbook.userId },
        data: {
          receivedCommentsCount: { increment: 1 },
          starlight: { increment: 1 },
        },
      });
    }

    return NextResponse.json(
      {
        data: {
          id: comment.id,
          nickname: comment.nickname,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          userId: comment.userId,
          image: comment.image || null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
