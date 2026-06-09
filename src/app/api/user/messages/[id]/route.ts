import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUser } from '@/lib/auth';

// PUT - 编辑自己的留言
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: { message: '请先登录', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const guestbook = await prisma.guestbook.findUnique({ where: { id } });

    if (!guestbook) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    if (guestbook.userId !== userPayload.userId) {
      return NextResponse.json(
        { error: { message: '无权编辑此留言', code: 'FORBIDDEN' } },
        { status: 403 },
      );
    }

    const body = await request.json();

    const updated = await prisma.guestbook.update({
      where: { id },
      data: {
        ...(body.content !== undefined && { content: body.content.trim() }),
        ...(body.storyTags !== undefined && { storyTags: body.storyTags }),
        ...(body.relatedYear !== undefined && { relatedYear: body.relatedYear }),
      },
    });

    return NextResponse.json({
      data: { id: updated.id, content: updated.content, updatedAt: updated.updatedAt.toISOString() },
    });
  } catch (error) {
    console.error('编辑留言失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// DELETE - 删除自己的留言
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: { message: '请先登录', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const guestbook = await prisma.guestbook.findUnique({ where: { id } });

    if (!guestbook) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    if (guestbook.userId !== userPayload.userId) {
      return NextResponse.json(
        { error: { message: '无权删除此留言', code: 'FORBIDDEN' } },
        { status: 403 },
      );
    }

    // 先查询用户当前 starlight，以便安全扣减
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { starlight: true },
    });

    const starlightDecrement = Math.min(user?.starlight ?? 0, 5);

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { targetType: 'guestbook', targetId: id } }),
      prisma.like.deleteMany({ where: { targetType: 'guestbook', targetId: id } }),
      prisma.guestbook.delete({ where: { id } }),
      prisma.user.update({
        where: { id: userPayload.userId },
        data: {
          postsCount: { decrement: 1 },
          starlight: { decrement: starlightDecrement },
        },
      }),
    ]);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('删除留言失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
